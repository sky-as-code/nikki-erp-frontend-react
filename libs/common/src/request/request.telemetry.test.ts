import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { validate as isUuid, version as uuidVersion } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestMaker } from './request';
import { DEFAULT_TELEMETRY_CONFIG } from '../telemetry/config';
import { traceOperation } from '../telemetry/operation';
import { initTelemetry, shutdownTelemetry } from '../telemetry/provider';

import type { TelemetryConfig } from '../telemetry/config';


const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-(0[01])$/;
const API_ORIGIN = 'https://example.test';

let exporter: InMemorySpanExporter;
let fetchMock: ReturnType<typeof vi.fn>;

function startTelemetry(overrides: Partial<TelemetryConfig> = {}): void {
	exporter = new InMemorySpanExporter();
	initTelemetry({
		...DEFAULT_TELEMETRY_CONFIG,
		propagationOrigins: [API_ORIGIN],
		spanProcessors: [new SimpleSpanProcessor(exporter)],
		...overrides,
	});
}

function okResponse(): Response {
	return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function newMaker(baseUrl = API_ORIGIN, ensureSession?: () => Promise<unknown>): RequestMaker {
	return new RequestMaker({ baseUrl, ensureSession });
}

function sentRequests(): Request[] {
	return fetchMock.mock.calls.map((call) => call[0] as Request);
}

function traceParts(request: Request): { traceId: string, spanId: string, flags: string } {
	const match = TRACEPARENT.exec(request.headers.get('traceparent') ?? '');
	expect(match).not.toBeNull();
	return { traceId: match![1], spanId: match![2], flags: match![3] };
}

function idOf(request: Request): string {
	return request.headers.get('X-Idempotency-ID') ?? '';
}

function clientSpans() {
	return exporter.getFinishedSpans().filter((span) => span.kind === SpanKind.CLIENT);
}

beforeEach(async () => {
	await shutdownTelemetry();
	startTelemetry();
	fetchMock = vi.fn().mockImplementation(async () => okResponse());
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(async () => {
	vi.unstubAllGlobals();
	await shutdownTelemetry();
});

describe('RequestMaker trace context', () => {
	it('AC-02: with no operation, opens a root CLIENT span and sends its valid traceparent', async () => {
		await newMaker().get('v1/things');

		const { traceId, spanId, flags } = traceParts(sentRequests()[0]);
		const [span] = clientSpans();
		expect(flags).toBe('01');
		expect(span.spanContext().traceId).toBe(traceId);
		expect(span.spanContext().spanId).toBe(spanId);
		expect(span.parentSpanContext).toBeUndefined();
		expect(span.name).toBe('GET');
	});

	it('AC-09 / ID-AC-04: overlapping operations with parallel calls keep their own traces and IDs', async () => {
		fetchMock.mockImplementation(async () => {
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
			return okResponse();
		});
		const maker = newMaker();
		const callThree = (op: Parameters<Parameters<typeof traceOperation>[1]>[0]) => Promise.all(
			[1, 2, 3].map((item) => maker.get(`v1/things/${op.name}/${item}`, { operation: op })),
		);

		const opIds = await Promise.all(['alpha', 'beta'].map((name) => traceOperation(name, async (op) => {
			await callThree(op);
			return op.span.spanContext();
		})));

		for (const [index, name] of ['alpha', 'beta'].entries()) {
			const own = sentRequests().filter((request) => request.url.includes(`/${name}/`));
			expect(own).toHaveLength(3);
			for (const request of own) {
				expect(traceParts(request).traceId).toBe(opIds[index].traceId);
				const span = clientSpans().find((item) => item.spanContext().spanId === traceParts(request).spanId);
				expect(span?.parentSpanContext?.spanId).toBe(opIds[index].spanId);
			}
		}
		expect(new Set(sentRequests().map(idOf)).size).toBe(6);
	});

	it('AC-11: sampled=0 still sends a valid traceparent and ID, and makes no export call', async () => {
		await shutdownTelemetry();
		startTelemetry({ samplerRatio: 0 });

		await newMaker().get('v1/things');

		const request = sentRequests()[0];
		expect(traceParts(request).flags).toBe('00');
		expect(traceParts(request).traceId).not.toBe('0'.repeat(32));
		expect(isUuid(idOf(request))).toBe(true);
		expect(exporter.getFinishedSpans()).toHaveLength(0);
		expect(fetchMock).toHaveBeenCalledOnce();
	});

});

describe('RequestMaker propagation allowlist', () => {
	it('AC-21: a target outside the allowlist gets neither trace context, baggage nor an ID', async () => {
		await traceOperation('op', (op) => newMaker('https://other.test').get('v1/things', { operation: op }));

		const request = sentRequests()[0];
		expect(request.headers.get('traceparent')).toBeNull();
		expect(request.headers.get('tracestate')).toBeNull();
		expect(request.headers.get('baggage')).toBeNull();
		expect(request.headers.get('X-Idempotency-ID')).toBeNull();
	});

	it('sends only allowlisted baggage keys', async () => {
		await shutdownTelemetry();
		startTelemetry({ baggageAllowlist: ['feature'] });
		const baggage = { feature: 'new-grid', secret: 'nope' };

		await traceOperation('op', (op) => newMaker().get('v1/things', { operation: op }), { baggage });

		expect(sentRequests()[0].headers.get('baggage')).toBe('feature=new-grid');
	});

	it('AC-22: the exporter endpoint itself is never instrumented', async () => {
		await shutdownTelemetry();
		startTelemetry({ exporter: 'otlp', exporterUrl: 'https://collector.test/v1/traces' });

		await newMaker('https://collector.test').ky().post('v1/traces', { json: {} });

		expect(sentRequests()[0].headers.get('traceparent')).toBeNull();
		expect(clientSpans()).toHaveLength(0);
	});
});

describe('RequestMaker idempotency ID', () => {
	it('ID-AC-01: mints a UUIDv7 before the first attempt and sends it', async () => {
		await newMaker().post('v1/things', { json: { a: 1 } });

		const id = idOf(sentRequests()[0]);
		expect(isUuid(id)).toBe(true);
		expect(uuidVersion(id)).toBe(7);
		expect(id).toBe(id.toLowerCase());
	});

	it('ID-AC-03: two identical requests in one trace get two IDs, neither derived from the trace', async () => {
		const maker = newMaker();

		await traceOperation('op', async (op) => {
			await maker.post('v1/things', { json: { a: 1 }, operation: op });
			await maker.post('v1/things', { json: { a: 1 }, operation: op });
		});

		const [first, second] = sentRequests();
		expect(idOf(first)).not.toBe(idOf(second));
		expect(traceParts(first).traceId).toBe(traceParts(second).traceId);
		for (const request of [first, second]) {
			expect(idOf(request).replaceAll('-', '')).not.toBe(traceParts(request).traceId);
		}
	});

	it('AC-12 / ID-AC-02: a second attempt keeps the ID and the trace, with a span of its own', async () => {
		fetchMock.mockResolvedValueOnce(new Response('{}', { status: 503 })).mockResolvedValueOnce(okResponse());
		const retry = { limit: 1, methods: ['get'], statusCodes: [503], delay: () => 0 };

		await traceOperation('op', (op) => newMaker().get('v1/things', { operation: op, retry }));

		const [first, second] = sentRequests();
		expect(idOf(first)).toBe(idOf(second));
		expect(traceParts(first).traceId).toBe(traceParts(second).traceId);
		expect(traceParts(first).spanId).not.toBe(traceParts(second).spanId);
		expect(clientSpans()).toHaveLength(2);
		expect(clientSpans()[0].status.code).toBe(SpanStatusCode.ERROR);
	});

	it('AC-12: a retried call with no operation still stays in one trace', async () => {
		fetchMock.mockResolvedValueOnce(new Response('{}', { status: 503 })).mockResolvedValueOnce(okResponse());
		const retry = { limit: 1, methods: ['get'], statusCodes: [503], delay: () => 0 };

		await newMaker().get('v1/things', { retry });

		const [first, second] = sentRequests();
		expect(idOf(first)).toBe(idOf(second));
		expect(traceParts(first).traceId).toBe(traceParts(second).traceId);
	});

});

describe('RequestMaker idempotency ID and the session refresh', () => {
	it('ID-AC-02: the session refresh is an independent request with its own ID', async () => {
		let refreshed = false;
		const maker: RequestMaker = newMaker(API_ORIGIN, async () => {
			if (refreshed) return;
			refreshed = true;
			await maker.post('v1/iam/refresh', { noAuth: true });
		});

		await maker.get('v1/things');

		const [refresh, original] = sentRequests();
		expect(refresh.url).toContain('refresh');
		expect(isUuid(idOf(refresh))).toBe(true);
		expect(idOf(refresh)).not.toBe(idOf(original));
	});

});

describe('RequestMaker idempotency ID across calls', () => {
	it('dedupKey-collapsed calls share one transmission, one ID and one span', async () => {
		const maker = newMaker();

		await Promise.all([
			maker.get('v1/things', { dedupKey: 'same' }),
			maker.get('v1/things', { dedupKey: 'same' }),
		]);

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(clientSpans()).toHaveLength(1);
	});

	it('reuses an ID the caller resends deliberately (FE-ID-04)', async () => {
		const idempotencyId = '0190f0a4-7b3c-7d2e-8a1b-1234567890ab';

		await newMaker().post('v1/things', { json: {}, idempotencyId });

		expect(idOf(sentRequests()[0])).toBe(idempotencyId);
	});

	it('gives raw ky() callers an ID and trace context through the shared hooks', async () => {
		await newMaker().ky().get('v1/reports/export');

		expect(isUuid(idOf(sentRequests()[0]))).toBe(true);
		expect(traceParts(sentRequests()[0]).flags).toBe('01');
		expect(clientSpans()).toHaveLength(1);
	});

	it('ends an aborted request span as cancelled, not as an error', async () => {
		fetchMock.mockRejectedValue(new DOMException('aborted', 'AbortError'));

		await expect(newMaker().get('v1/things')).rejects.toThrow();

		const [span] = clientSpans();
		expect(span.attributes['coremart.cancelled']).toBe(true);
		expect(span.status.code).toBe(SpanStatusCode.UNSET);
	});
});
