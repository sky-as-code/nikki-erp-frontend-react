import http from 'node:http';

import { context, propagation, ROOT_CONTEXT, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { InMemorySpanExporter, SamplingDecision, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { afterEach, describe, expect, it } from 'vitest';

import { filterBaggage, MAX_BAGGAGE_BYTES, MAX_BAGGAGE_ENTRIES } from './baggage_propagator';
import { buildSampler, initTelemetry, resetTelemetry } from './provider';
import { loadTelemetryConfig, parsePropagationHosts, parseRatio, parseResourceAttributes } from '../common/config/env';

import type { AddressInfo } from 'node:net';


const ENV_KEYS = ['OTEL_SERVICE_NAME', 'NIKKI_BFF_OTEL_TRACES_SAMPLER_ARG', 'OTEL_TRACES_EXPORTER',
	'OTEL_RESOURCE_ATTRIBUTES', 'NIKKI_BFF_TELEMETRY_BAGGAGE_ALLOWLIST', 'NIKKI_BFF_TELEMETRY_SHUTDOWN_FLUSH_MS'];
const TRACE_ID = 'a'.repeat(32);

afterEach(async () => {
	ENV_KEYS.forEach((key) => delete process.env[key]);
	await resetTelemetry();
});

describe('telemetry config', () => {
	it('defaults to coremart-bff, parent-based full sampling and no export', () => {
		const config = loadTelemetryConfig();
		expect(config).toMatchObject({
			serviceName: 'coremart-bff', sampler: 'parentbased_traceidratio', samplerArg: 1, exporter: 'none',
			propagators: ['tracecontext', 'baggage'], baggageAllowlist: [], shutdownFlushMs: 3000,
		});
		expect(config.serviceInstanceId).toContain(`-${process.pid}-`);
	});

	it('maps the standard names, the NIKKI_BFF_OTEL_ alias and the policy keys', () => {
		Object.assign(process.env, {
			OTEL_SERVICE_NAME: 'bff-x', NIKKI_BFF_OTEL_TRACES_SAMPLER_ARG: '0.1', OTEL_TRACES_EXPORTER: 'OTLP',
			OTEL_RESOURCE_ATTRIBUTES: 'service.version=1.0.0,deployment.environment.name=staging,team=a%20b',
			NIKKI_BFF_TELEMETRY_BAGGAGE_ALLOWLIST: 'feature, tier', NIKKI_BFF_TELEMETRY_SHUTDOWN_FLUSH_MS: '9000',
		});
		expect(loadTelemetryConfig()).toMatchObject({
			serviceName: 'bff-x', samplerArg: 0.1, exporter: 'otlp', serviceVersion: '1.0.0',
			deploymentEnvironment: 'staging', resourceAttributes: { team: 'a b' }, baggageAllowlist: ['feature', 'tier'],
			shutdownFlushMs: 4000,
		});
	});

	it('parses ratios, resource attributes and propagation hosts defensively', () => {
		expect([parseRatio('0.25'), parseRatio('2'), parseRatio('x'), parseRatio('')]).toEqual([0.25, 1, 1, 1]);
		expect(parseResourceAttributes('a=1,broken,=x,b=%E0')).toEqual({ a: '1' });
		const base = new URL('https://Api.Internal:4433');
		expect(parsePropagationHosts('', base)).toEqual(['api.internal']);
		expect(parsePropagationHosts('A.example, b.example', base)).toEqual(['a.example', 'b.example']);
	});

	it('samples roots by ratio and follows the parent decision', () => {
		const sampler = buildSampler({ sampler: 'parentbased_traceidratio', samplerArg: 0 });
		const root = sampler.shouldSample(ROOT_CONTEXT, TRACE_ID, 'n', 1, {}, []);
		expect(root.decision).toBe(SamplingDecision.NOT_RECORD);
		const parent = trace.setSpanContext(ROOT_CONTEXT, { traceId: TRACE_ID, spanId: 'b'.repeat(16), traceFlags: 1 });
		expect(sampler.shouldSample(parent, TRACE_ID, 'n', 1, {}, []).decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
	});
});

describe('baggage limits (AC-08)', () => {
	it(`keeps at most ${MAX_BAGGAGE_ENTRIES} allowlisted entries, in header order`, () => {
		const keys = Array.from({ length: 20 }, (_, i) => `k${i}`);
		const baggage = propagation.createBaggage(Object.fromEntries(keys.map((key) => [key, { value: 'v' }])));
		expect(filterBaggage(baggage, new Set(keys)).map(([key]) => key)).toEqual(keys.slice(0, 16));
	});

	it(`drops the entry crossing ${MAX_BAGGAGE_BYTES} bytes and every later one`, () => {
		const baggage = propagation.createBaggage({
			a: { value: 'x'.repeat(1000) }, b: { value: 'y'.repeat(1000) }, c: { value: 'z'.repeat(100) }, d: { value: '1' },
		});
		expect(filterBaggage(baggage, new Set(['a', 'b', 'c', 'd'])).map(([key]) => key)).toEqual(['a', 'b']);
	});
});

describe('exporter (AC-22)', () => {
	it('sends OTLP without trace headers and creates no span for its own request', async () => {
		const received: http.IncomingHttpHeaders[] = [];
		const collector = http.createServer((req, res) => {
			received.push(req.headers);
			req.resume();
			req.on('end', () => res.end('{}'));
		});
		await new Promise<void>((resolve) => collector.listen(0, '127.0.0.1', resolve));
		const url = `http://127.0.0.1:${(collector.address() as AddressInfo).port}/v1/traces`;
		const memory = new InMemorySpanExporter();
		const processors = [new SimpleSpanProcessor(memory), new SimpleSpanProcessor(new OTLPTraceExporter({ url }))];
		const { provider } = initTelemetry(loadTelemetryConfig(), { spanProcessors: processors });
		const span = trace.getTracer('test').startSpan('work');
		context.with(trace.setSpan(context.active(), span), () => span.end());
		await provider.forceFlush();
		collector.close();
		expect(received).toHaveLength(1);
		expect(received[0]).not.toHaveProperty('traceparent');
		expect(received[0]).not.toHaveProperty('x-idempotency-id');
		expect(memory.getFinishedSpans().map((finished) => finished.name)).toEqual(['work']);
	});
});
