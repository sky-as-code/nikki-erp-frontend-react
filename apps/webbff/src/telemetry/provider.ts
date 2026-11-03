import { context, propagation, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator, setGlobalErrorHandler, W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter as GrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as HttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
	AlwaysOffSampler, AlwaysOnSampler, BatchSpanProcessor, ConsoleSpanExporter, NodeTracerProvider, ParentBasedSampler,
	TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';

import { createAllowlistBaggagePropagator } from './baggage_propagator';
import { setServiceIdentity } from './identity';
import { createJsonLogger } from '../common/logging/logger';

import type { TelemetryConfig } from '../common/config/types';
import type { Logger } from '../common/logging/logger';
import type { TextMapPropagator } from '@opentelemetry/api';
import type { Sampler, SpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace-node';


export const TRACER_NAME = 'webbff';
const ERROR_LOG_INTERVAL_MS = 60_000;

export interface TelemetryHandle {
	readonly provider: NodeTracerProvider;
	/** Flushes and stops the provider; resolves after at most `timeoutMs`, whatever the exporter does. */
	shutdown(timeoutMs: number): Promise<void>;
}

export interface TelemetryOverrides {
	/** Replaces the configured export, e.g. a `SimpleSpanProcessor` over an `InMemorySpanExporter` in tests. */
	readonly spanProcessors?: SpanProcessor[];
	readonly logger?: Logger;
}

let handle: TelemetryHandle | undefined;

/**
 * One provider per process. Always an SDK provider, never a no-op one: with export off it has no processor, but
 * span ids, sampling flags and propagation still work (SMP-03).
 */
export function initTelemetry(config: TelemetryConfig, overrides: TelemetryOverrides = {}): TelemetryHandle {
	if (handle) {
		return handle;
	}
	const logger = overrides.logger ?? createJsonLogger();
	setServiceIdentity(config);
	setGlobalErrorHandler(createRateLimitedErrorHandler(logger));
	const provider = new NodeTracerProvider({
		resource: resourceFromAttributes(buildResourceAttributes(config)),
		sampler: buildSampler(config),
		spanProcessors: overrides.spanProcessors ?? buildSpanProcessors(config, logger),
	});
	provider.register({
		contextManager: new AsyncLocalStorageContextManager(),
		propagator: buildPropagator(config),
	});
	handle = { provider, shutdown: (timeoutMs) => shutDownProvider(provider, timeoutMs, logger) };
	return handle;
}

export function getTelemetry(): TelemetryHandle | undefined {
	return handle;
}

/** Test only: unregisters the global provider, context manager and propagator so the next init starts clean. */
export async function resetTelemetry(): Promise<void> {
	await handle?.provider.shutdown();
	handle = undefined;
	trace.disable();
	context.disable();
	propagation.disable();
}

export function getTracer() {
	return trace.getTracer(TRACER_NAME);
}

function buildResourceAttributes(config: TelemetryConfig): Record<string, string> {
	return {
		...config.resourceAttributes,
		'service.name': config.serviceName,
		'service.version': config.serviceVersion,
		'service.instance.id': config.serviceInstanceId,
		'deployment.environment.name': config.deploymentEnvironment,
	};
}

export function buildSampler(config: Pick<TelemetryConfig, 'sampler' | 'samplerArg'>): Sampler {
	const ratio = new TraceIdRatioBasedSampler(config.samplerArg);
	switch (config.sampler) {
		case 'always_on': return new AlwaysOnSampler();
		case 'always_off': return new AlwaysOffSampler();
		case 'traceidratio': return ratio;
		case 'parentbased_always_on': return new ParentBasedSampler({ root: new AlwaysOnSampler() });
		case 'parentbased_always_off': return new ParentBasedSampler({ root: new AlwaysOffSampler() });
		default: return new ParentBasedSampler({ root: ratio });
	}
}

export function buildPropagator(config: Pick<TelemetryConfig, 'propagators' | 'baggageAllowlist'>): TextMapPropagator {
	const propagators: TextMapPropagator[] = [];
	if (config.propagators.includes('tracecontext')) {
		propagators.push(new W3CTraceContextPropagator());
	}
	if (config.propagators.includes('baggage')) {
		propagators.push(createAllowlistBaggagePropagator(config.baggageAllowlist));
	}
	return new CompositePropagator({ propagators });
}

function buildSpanProcessors(config: TelemetryConfig, logger: Logger): SpanProcessor[] {
	const exporter = buildExporter(config, logger);
	return exporter ? [new BatchSpanProcessor(exporter, config.batch)] : [];
}

/** No exporter unless one is configured; never a default localhost or public endpoint (EXP-02). */
function buildExporter(config: TelemetryConfig, logger: Logger): SpanExporter | undefined {
	if (config.exporter === 'console') {
		return new ConsoleSpanExporter();
	}
	if (config.exporter !== 'otlp') {
		return undefined;
	}
	if (!config.otlpEndpoint) {
		logger.warn('OTEL_TRACES_EXPORTER=otlp without OTEL_EXPORTER_OTLP_ENDPOINT: traces are not exported');
		return undefined;
	}
	const timeoutMillis = config.batch.exportTimeoutMillis;
	if (config.otlpProtocol === 'grpc') {
		return new GrpcTraceExporter({ url: config.otlpEndpoint, timeoutMillis });
	}
	const url = `${config.otlpEndpoint.replace(/\/+$/, '')}/v1/traces`;
	return new HttpTraceExporter({ url, timeoutMillis });
}

/** Export failures are logged at most once a minute, with the count of the ones swallowed (EXP-01). */
function createRateLimitedErrorHandler(logger: Logger): (err: unknown) => void {
	let lastLoggedAt = 0;
	let suppressed = 0;
	return (err) => {
		const now = Date.now();
		if (now - lastLoggedAt < ERROR_LOG_INTERVAL_MS) {
			suppressed += 1;
			return;
		}
		logger.warn('OpenTelemetry SDK error', { error: describeError(err), suppressed });
		lastLoggedAt = now;
		suppressed = 0;
	};
}

function describeError(err: unknown): string {
	return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}

async function shutDownProvider(provider: NodeTracerProvider, timeoutMs: number, logger: Logger): Promise<void> {
	let timer: NodeJS.Timeout | undefined;
	const deadline = new Promise<'timeout'>((resolve) => {
		timer = setTimeout(() => resolve('timeout'), timeoutMs);
		timer.unref();
	});
	try {
		const outcome = await Promise.race([provider.shutdown().then(() => 'done' as const), deadline]);
		if (outcome === 'timeout') {
			logger.warn(`Telemetry flush did not finish within ${timeoutMs}ms; pending spans are dropped`);
		}
	}
	catch (err) {
		logger.warn('Telemetry shutdown failed', { error: describeError(err) });
	}
	finally {
		clearTimeout(timer);
	}
}
