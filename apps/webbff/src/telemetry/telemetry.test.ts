import http, { type IncomingMessage } from 'node:http';

import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { initTelemetry, resetTelemetry } from './provider';
import { createApiApp } from '../app';
import { createContainer } from '../common/ioc/container';
import { createJsonLogger } from '../common/logging/logger';

import type { AppConfig, TelemetryConfig } from '../common/config/types';
import type { UpstreamClient } from '../common/http/upstream_client';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-node';
import type { AddressInfo } from 'node:net';


type Captured = { url?: string; headers: IncomingMessage['headers'] };

const TRACE_ID = '4bf92f3577b34da6a3ce929d0e0e4736';
const PARENT_SPAN_ID = '00f067aa0ba902b7';
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VALID_ID = '019a46c2-2a40-7b35-9e0f-8e2fd22b9b6c';
const TELEMETRY_CONFIG: TelemetryConfig = {
	serviceName: 'coremart-bff', serviceVersion: 'test', deploymentEnvironment: 'test', serviceInstanceId: 'i-1',
	resourceAttributes: {}, propagators: ['tracecontext', 'baggage'], sampler: 'parentbased_traceidratio',
	samplerArg: 1, exporter: 'none', otlpProtocol: 'http/json', otlpEndpoint: '',
	batch: { maxQueueSize: 10, maxExportBatchSize: 5, scheduledDelayMillis: 10, exportTimeoutMillis: 100 },
	baggageAllowlist: ['feature'], shutdownFlushMs: 100,
};

const exporter = new InMemorySpanExporter();
const logLines: string[] = [];
let captured: Captured[] = [];
let echoedId: string | undefined;
const upstream = http.createServer((req, res) => {
	captured.push({ url: req.url, headers: req.headers });
	req.resume();
	req.on('end', () => {
		res.writeHead(200, {
			'content-type': 'application/json', 'x-trace-id': 'f'.repeat(32),
			...(echoedId ? { 'x-idempotency-id': echoedId } : {}),
		});
		res.end('{"ok":true}');
	});
});
const servers: http.Server[] = [];
let upstreamPort = 0;
let bffUrl = '';

function listen(server: http.Server): Promise<number> {
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port)));
}

function buildConfig(port: number, propagationHosts?: string[]): AppConfig {
	return {
		nodeEnv: 'test', isLocal: false, clientRootPath: '', clientConfig: { BASE_API_URL: '/api' },
		http: { host: '', port: '0', httpsEnabled: false, certificateFile: '', privateKeyFile: '' },
		upstream: {
			baseUrl: new URL(`http://127.0.0.1:${port}`), forwardHost: false, timeoutMs: 2000,
			tls: { caFiles: [], insecure: false }, propagationHosts,
		},
		cookie: { secure: false },
		corsOrigins: [],
		schemaCacheTtlMins: 30,
	};
}

async function startBff(config: AppConfig, upstreamOverride?: UpstreamClient): Promise<string> {
	const logger = createJsonLogger((_severity, line) => logLines.push(line));
	const container = createContainer(config, { logger, ...(upstreamOverride ? { upstream: upstreamOverride } : {}) });
	const server = http.createServer(createApiApp(container));
	servers.push(server);
	return `http://127.0.0.1:${await listen(server)}`;
}

/** Spans are ended on `finish`, which can follow the client's read of the body by a tick. */
async function spansOf(traceId: string, count: number): Promise<ReadableSpan[]> {
	for (let attempt = 0; attempt < 50; attempt++) {
		const spans = exporter.getFinishedSpans().filter((span) => span.spanContext().traceId === traceId);
		if (spans.length >= count) {
			return spans;
		}
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
	return exporter.getFinishedSpans().filter((span) => span.spanContext().traceId === traceId);
}

function serverSpan(spans: ReadableSpan[]): ReadableSpan {
	return spans.find((span) => span.kind === SpanKind.SERVER)!;
}

function parseTraceparent(value: unknown): { traceId: string; spanId: string; flags: string } {
	const [, traceId, spanId, flags] = String(value).split('-');
	return { traceId, spanId, flags };
}

function rawRequest(path: string, headers: Array<[string, string]>): Promise<IncomingMessage> {
	const port = Number(new URL(bffUrl).port);
	return new Promise((resolve, reject) => {
		const rawHeaders = [['host', `127.0.0.1:${port}`], ...headers].flat();
		const request = http.request({ host: '127.0.0.1', port, path, method: 'GET', headers: rawHeaders });
		request.on('response', (response) => {
			response.resume();
			response.on('end', () => resolve(response));
		});
		request.on('error', reject);
		request.end();
	});
}

beforeAll(async () => {
	const spanProcessors = [new SimpleSpanProcessor(exporter)];
	initTelemetry(TELEMETRY_CONFIG, { spanProcessors, logger: createJsonLogger() });
	upstreamPort = await listen(upstream);
	bffUrl = await startBff(buildConfig(upstreamPort));
});

afterAll(async () => {
	servers.forEach((server) => server.close());
	upstream.close();
	await resetTelemetry();
});

beforeEach(() => {
	captured = [];
	echoedId = undefined;
	logLines.length = 0;
	exporter.reset();
});

describe('BFF trace context', () => {
	it('AC-03: starts a root SERVER span, answers X-Trace-ID and continues the trace upstream', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user?secret=1`);
		const traceId = res.headers.get('x-trace-id')!;
		expect(traceId).toMatch(/^[0-9a-f]{32}$/);
		expect(traceId).not.toBe('f'.repeat(32));
		const spans = await spansOf(traceId, 2);
		const server = serverSpan(spans);
		const client = spans.find((span) => span.kind === SpanKind.CLIENT)!;
		expect(server.parentSpanContext).toBeUndefined();
		expect(server.name).toBe('GET /api/*');
		expect(JSON.stringify(server.attributes)).not.toContain('secret');
		expect(client.parentSpanContext?.spanId).toBe(server.spanContext().spanId);
		const sent = parseTraceparent(captured[0].headers.traceparent);
		expect(sent).toEqual({ traceId, spanId: client.spanContext().spanId, flags: '01' });
	});

	it('AC-05: continues a valid inbound parent without regenerating the trace id', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, {
			headers: { traceparent: `00-${TRACE_ID}-${PARENT_SPAN_ID}-01` },
		});
		expect(res.headers.get('x-trace-id')).toBe(TRACE_ID);
		const server = serverSpan(await spansOf(TRACE_ID, 2));
		expect(server.parentSpanContext?.spanId).toBe(PARENT_SPAN_ID);
		expect(parseTraceparent(captured[0].headers.traceparent).spanId).not.toBe(PARENT_SPAN_ID);
	});

	it.each([
		['malformed', 'garbage'],
		['zero trace id', `00-${'0'.repeat(32)}-${PARENT_SPAN_ID}-01`],
		['forbidden version', `ff-${TRACE_ID}-${PARENT_SPAN_ID}-01`],
	])('AC-06: a %s traceparent starts a new trace and the request still succeeds', async (_kind, value) => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, { headers: { traceparent: value } });
		expect(res.status).toBe(200);
		expect(res.headers.get('x-trace-id')).toMatch(/^[0-9a-f]{32}$/);
		expect(res.headers.get('x-trace-id')).not.toBe(TRACE_ID);
		expect(logLines.join('\n')).not.toContain(value);
	});

	it('AC-06: two ambiguous traceparent values start a new trace', async () => {
		const other = `00-${'a'.repeat(32)}-${PARENT_SPAN_ID}-01`;
		const res = await rawRequest('/api/v1/iam/iam_user', [
			['traceparent', `00-${TRACE_ID}-${PARENT_SPAN_ID}-01`], ['traceparent', other],
		]);
		expect(res.statusCode).toBe(200);
		expect(res.headers['x-trace-id']).not.toBe(TRACE_ID);
		expect(res.headers['x-trace-id']).not.toBe('a'.repeat(32));
	});

});

describe('BFF inbound context hygiene', () => {
	it('AC-07: keeps a valid traceparent when tracestate is broken', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, {
			headers: { traceparent: `00-${TRACE_ID}-${PARENT_SPAN_ID}-01`, tracestate: '=;;broken==,,' },
		});
		expect(res.headers.get('x-trace-id')).toBe(TRACE_ID);
		expect(captured[0].headers.tracestate ?? '').not.toContain('broken');
	});

	it('AC-08: drops baggage keys outside the allowlist and never forwards the raw header', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, {
			headers: {
				traceparent: `00-${TRACE_ID}-${PARENT_SPAN_ID}-01`,
				baggage: 'org_id=org-fake,api_key=s3cr3t,feature=beta',
			},
		});
		expect(res.headers.get('x-trace-id')).toBe(TRACE_ID);
		expect(captured[0].headers.baggage).toBe('feature=beta');
	});

	it('AC-11 / ID-AC-11: sampled=0 keeps valid ids in headers and exports nothing', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, {
			headers: { traceparent: `00-${TRACE_ID}-${PARENT_SPAN_ID}-00` },
		});
		expect(res.headers.get('x-trace-id')).toBe(TRACE_ID);
		expect(res.headers.get('x-idempotency-id')).toMatch(UUID_V7);
		const sent = parseTraceparent(captured[0].headers.traceparent);
		expect(sent).toMatchObject({ traceId: TRACE_ID, flags: '00' });
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(exporter.getFinishedSpans()).toEqual([]);
	});

	it('never passes the upstream X-Trace-ID through raw', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`);
		expect(res.headers.get('x-trace-id')).not.toBe('f'.repeat(32));
	});
});

describe('BFF answers of the application itself (AC-15)', () => {
	it.each([
		['401', 'POST', '/api/v1/iam/signin/refresh', {}, 401],
		['403', 'POST', '/api/v1/iam/iam_user', { cookie: 'nikki_at=tok', origin: 'https://evil.test' }, 403],
		['404', 'GET', '/api/foo', {}, 404],
	])('%s keeps X-Trace-ID, X-Idempotency-ID and an ended unset-status span', async (_name, method, path, headers, code) => {
		const res = await fetch(`${bffUrl}${path}`, { method, headers });
		expect(res.status).toBe(code);
		expect(res.headers.get('x-idempotency-id')).toMatch(UUID_V7);
		const server = serverSpan(await spansOf(res.headers.get('x-trace-id')!, 1));
		expect(server.attributes['http.response.status_code']).toBe(code);
		expect(server.status.code).toBe(SpanStatusCode.UNSET);
	});

	it('500: the error handler logs with the request context and marks the span as an error', async () => {
		const throwing = { forward: () => {
			throw new Error('boom');
		} } as unknown as UpstreamClient;
		const url = await startBff(buildConfig(upstreamPort), throwing);
		const res = await fetch(`${url}/api/v1/iam/iam_user`);
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_internal_server' })]);
		const traceId = res.headers.get('x-trace-id')!;
		const server = serverSpan(await spansOf(traceId, 1));
		expect(server.status.code).toBe(SpanStatusCode.ERROR);
		expect(server.events.map((event) => event.name)).toContain('exception');
		const record = JSON.parse(logLines.find((line) => line.includes('Unhandled error'))!);
		expect(record).toMatchObject({
			severity: 'ERROR', trace_id: traceId, idempotency_id: res.headers.get('x-idempotency-id'),
		});
	});
});

describe('BFF X-Idempotency-ID', () => {
	it('ID-AC-05: generates one id when missing and sends the same one upstream', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`);
		const id = res.headers.get('x-idempotency-id');
		expect(id).toMatch(UUID_V7);
		expect(captured[0].headers['x-idempotency-id']).toBe(id);
	});

	it('ID-AC-07: lowercases a valid uppercase UUIDv7', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, { headers: { 'X-Idempotency-ID': VALID_ID.toUpperCase() } });
		expect(res.headers.get('x-idempotency-id')).toBe(VALID_ID);
		expect(captured[0].headers['x-idempotency-id']).toBe(VALID_ID);
	});

});

describe('BFF X-Idempotency-ID rejections', () => {
	it.each([
		['empty', ''],
		['UUIDv4', '9b2e4f4e-1c3a-4d5e-8f60-123456789abc'],
		['zero UUID', '00000000-0000-0000-0000-000000000000'],
		['URN', `urn:uuid:${VALID_ID}`],
		['braces', `{${VALID_ID}}`],
		['comma list', `${VALID_ID},${VALID_ID}`],
		['bad variant', '019a46c2-2a40-7b35-7e0f-8e2fd22b9b6c'],
	])('ID-AC-08: rejects a %s value with 400 and runs no handler', async (_kind, value) => {
		const res = await rawRequest('/api/v1/iam/iam_user', [['X-Idempotency-ID', value]]);
		expect(res.statusCode).toBe(400);
		expect(res.headers['x-idempotency-id']).toBeUndefined();
		expect(res.headers['x-trace-id']).toMatch(/^[0-9a-f]{32}$/);
		expect(captured).toEqual([]);
		if (value) {
			expect(logLines.join('\n')).not.toContain(value);
		}
	});

	it('ID-AC-08: rejects the header sent twice, even with equal values, in the backend error format', async () => {
		const res = await rawRequest('/api/v1/iam/iam_user', [
			['X-Idempotency-ID', VALID_ID], ['X-Idempotency-ID', VALID_ID],
		]);
		expect(res.statusCode).toBe(400);
		expect(captured).toEqual([]);
		const body = await (await fetch(`${bffUrl}/api/v1/iam/iam_user`, { headers: { 'X-Idempotency-ID': 'x' } })).json();
		expect(body).toEqual([{
			type: 'validation', key: 'common:err_invalid_idempotency_id', field: 'X-Idempotency-ID',
			message: expect.any(String),
		}]);
		expect(JSON.parse(logLines[0])).toMatchObject({ idempotency_id: null, data: { reason: 'multiple_values' } });
	});

});

describe('BFF X-Idempotency-ID fallback and echo', () => {
	it('ID-AC-14: two requests without the header get two different ids', async () => {
		const first = (await fetch(`${bffUrl}/api/v1/iam/iam_user`)).headers.get('x-idempotency-id');
		const second = (await fetch(`${bffUrl}/api/v1/iam/iam_user`)).headers.get('x-idempotency-id');
		expect(first).toMatch(UUID_V7);
		expect(second).toMatch(UUID_V7);
		expect(first).not.toBe(second);
	});

	it('ID-AC-17: keeps its own id and logs a mismatch when the upstream echoes another', async () => {
		echoedId = '019a46c2-2a40-7b35-9e0f-000000000001';
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, { headers: { 'X-Idempotency-ID': VALID_ID } });
		expect(res.headers.get('x-idempotency-id')).toBe(VALID_ID);
		const record = JSON.parse(logLines.find((line) => line.includes('different X-Idempotency-ID'))!);
		expect(record).toMatchObject({
			severity: 'WARN', idempotency_id: VALID_ID, trace_id: res.headers.get('x-trace-id'),
			data: { upstream_idempotency_id: echoedId },
		});
	});
});

describe('BFF propagation host allowlist (AC-21)', () => {
	it('sends no trace, baggage or idempotency header to a host outside the allowlist', async () => {
		const url = await startBff(buildConfig(upstreamPort, ['backend.internal']));
		await fetch(`${url}/api/v1/iam/iam_user`, {
			headers: {
				traceparent: `00-${TRACE_ID}-${PARENT_SPAN_ID}-01`, tracestate: 'vendor=1', baggage: 'feature=beta',
				'X-Idempotency-ID': VALID_ID,
			},
		});
		expect(captured).toHaveLength(1);
		for (const name of ['traceparent', 'tracestate', 'baggage', 'x-idempotency-id', 'x-trace-id']) {
			expect(captured[0].headers).not.toHaveProperty(name);
		}
	});

	it('does not follow an upstream redirect, so nothing reaches the redirect target', async () => {
		let reachedTarget = false;
		const target = http.createServer((_req, res) => {
			reachedTarget = true;
			res.end();
		});
		const targetPort = await listen(target);
		const redirecting = http.createServer((_req, res) => {
			res.writeHead(302, { location: `http://127.0.0.1:${targetPort}/steal` });
			res.end();
		});
		const url = await startBff(buildConfig(await listen(redirecting)));
		const res = await fetch(`${url}/api/v1/iam/iam_user`, { redirect: 'manual' });
		redirecting.close();
		target.close();
		expect(res.status).toBe(302);
		expect(reachedTarget).toBe(false);
	});
});
