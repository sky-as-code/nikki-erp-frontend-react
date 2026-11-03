import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
	BatchSpanProcessor, ParentBasedSampler, TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { readTelemetryConfig } from './config';

import type { TelemetryConfig } from './config';
import type { Tracer } from '@opentelemetry/api';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';


const TRACER_NAME = '@nikkierp/common';

// Bounded so a dead collector costs at most this many spans of memory and never blocks the UI.
const BATCH_LIMITS = Object.freeze({
	maxQueueSize: 1024,
	maxExportBatchSize: 256,
	scheduledDelayMillis: 5000,
	exportTimeoutMillis: 10000,
});

type TelemetryState = {
	config: TelemetryConfig,
	provider: WebTracerProvider,
	tracer: Tracer,
};

/**
 * One provider per loaded copy of this module. `RequestMaker.initDefault` runs once per micro-app,
 * so nothing here may be per-instance: the first call wins and later calls are no-ops.
 */
let state: TelemetryState | null = null;

/**
 * Starts browser tracing. Idempotent, and never throws: telemetry must not break the page.
 * The provider is always a real SDK provider, so trace and span IDs are valid even with no exporter.
 * It is deliberately not registered globally: the request layer and `traceOperation` use it directly,
 * and nothing else in the page should start emitting spans by accident.
 */
export function initTelemetry(config?: TelemetryConfig): void {
	if (state) return;
	const effective = config ?? safeReadConfig();
	try {
		state = createState(effective);
	}
	catch (error) {
		console.warn('Telemetry init failed; continuing without export', error);
		state = createState({ ...effective, exporter: 'none', spanProcessors: [] });
	}
}

/** Flushes best effort and forgets the provider, so the next {@link initTelemetry} starts afresh. */
export async function shutdownTelemetry(): Promise<void> {
	const current = state;
	state = null;
	await current?.provider.shutdown().catch(() => undefined);
}

/** The settings in force, initialising from the runtime config when nothing did yet (FE-04). */
export function telemetryConfig(): TelemetryConfig {
	return ensureState().config;
}

export function telemetryTracer(): Tracer {
	return ensureState().tracer;
}

function ensureState(): TelemetryState {
	if (!state) initTelemetry();
	return state!;
}

function safeReadConfig(): TelemetryConfig {
	try {
		return readTelemetryConfig();
	}
	catch {
		return readTelemetryConfig({});
	}
}

function createState(config: TelemetryConfig): TelemetryState {
	const provider = new WebTracerProvider({
		resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: config.serviceName }),
		sampler: new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(config.samplerRatio) }),
		spanProcessors: buildProcessors(config),
	});
	return { config, provider, tracer: provider.getTracer(TRACER_NAME) };
}

function buildProcessors(config: TelemetryConfig): SpanProcessor[] {
	const processors = [...(config.spanProcessors ?? [])];
	if (config.exporter === 'otlp' && config.exporterUrl) {
		processors.push(new BatchSpanProcessor(new OTLPTraceExporter({ url: config.exporterUrl }), BATCH_LIMITS));
	}
	return processors;
}
