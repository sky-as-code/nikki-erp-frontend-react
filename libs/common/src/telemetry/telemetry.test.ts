import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_TELEMETRY_CONFIG, readTelemetryConfig } from './config';
import { newIdempotencyId } from './idempotency';
import { traceOperation } from './operation';
import { isPropagationTarget } from './propagation';
import { initTelemetry, shutdownTelemetry, telemetryConfig } from './provider';


let exporter: InMemorySpanExporter;

beforeEach(async () => {
	await shutdownTelemetry();
	exporter = new InMemorySpanExporter();
	initTelemetry({ ...DEFAULT_TELEMETRY_CONFIG, spanProcessors: [new SimpleSpanProcessor(exporter)] });
});

afterEach(async () => {
	await shutdownTelemetry();
});

describe('readTelemetryConfig', () => {
	it('defaults to no export, full sampling, same-origin /api and no baggage', () => {
		expect(readTelemetryConfig({})).toEqual({ ...DEFAULT_TELEMETRY_CONFIG, propagationOrigins: ['/api'] });
	});

	it('reads the NIKKI_PUBLIC_OTEL_* keys the BFF serves without their prefix', () => {
		const config = readTelemetryConfig({
			OTEL_EXPORTER: 'otlp',
			OTEL_EXPORTER_URL: 'https://collector.test/v1/traces',
			OTEL_SAMPLER_ARG: '0.1',
			OTEL_PROPAGATION_ORIGINS: '/api, https://partner.test',
			OTEL_BAGGAGE_ALLOWLIST: 'feature',
		});

		expect(config.exporter).toBe('otlp');
		expect(config.samplerRatio).toBe(0.1);
		expect(config.propagationOrigins).toEqual(['/api', 'https://partner.test']);
		expect(config.baggageAllowlist).toEqual(['feature']);
	});

	it('stays in no-export mode when otlp has no endpoint, and ignores an out-of-range ratio', () => {
		const config = readTelemetryConfig({ OTEL_EXPORTER: 'otlp', OTEL_SAMPLER_ARG: '5' });

		expect(config.exporter).toBe('none');
		expect(config.samplerRatio).toBe(1);
	});
});

describe('initTelemetry', () => {
	it('is idempotent: a second call, e.g. from another micro-app, changes nothing', () => {
		initTelemetry({ ...DEFAULT_TELEMETRY_CONFIG, samplerRatio: 0 });

		expect(telemetryConfig().samplerRatio).toBe(1);
	});
});

describe('traceOperation', () => {
	it('runs fn in a root INTERNAL span ended when fn resolves', async () => {
		const result = await traceOperation('inventory.product.update', async () => 42);

		const [span] = exporter.getFinishedSpans();
		expect(result).toBe(42);
		expect(span.name).toBe('inventory.product.update');
		expect(span.kind).toBe(SpanKind.INTERNAL);
		expect(span.parentSpanContext).toBeUndefined();
	});

	it('records a failure and rethrows it unchanged', async () => {
		const failure = new Error('boom');

		await expect(traceOperation('op', async () => {
			throw failure;
		})).rejects.toBe(failure);

		expect(exporter.getFinishedSpans()[0].status.code).toBe(SpanStatusCode.ERROR);
	});

	it('marks a cancelled operation without making it an error', async () => {
		await expect(traceOperation('op', async () => {
			throw new DOMException('aborted', 'AbortError');
		})).rejects.toThrow();

		const [span] = exporter.getFinishedSpans();
		expect(span.attributes['coremart.cancelled']).toBe(true);
		expect(span.status.code).toBe(SpanStatusCode.UNSET);
	});

	it('starts a new trace per operation (a user retry is a new operation)', async () => {
		const first = await traceOperation('op', async (op) => op.span.spanContext().traceId);
		const second = await traceOperation('op', async (op) => op.span.spanContext().traceId);

		expect(first).not.toBe(second);
	});
});

describe('newIdempotencyId', () => {
	it('returns a distinct lowercase UUIDv7 per call', () => {
		const ids = new Set(Array.from({ length: 100 }, () => newIdempotencyId()));

		expect(ids.size).toBe(100);
		for (const id of ids) {
			expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		}
	});
});

describe('isPropagationTarget', () => {
	it('matches allowlisted origins by path prefix, never a look-alike path or host', async () => {
		await shutdownTelemetry();
		initTelemetry({ ...DEFAULT_TELEMETRY_CONFIG, propagationOrigins: ['https://app.test/api'] });

		expect(isPropagationTarget('https://app.test/api/v1/things')).toBe(true);
		expect(isPropagationTarget('https://app.test/apix')).toBe(false);
		expect(isPropagationTarget('https://app.test.evil/api/v1')).toBe(false);
	});
});
