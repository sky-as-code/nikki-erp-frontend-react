import http, { type IncomingMessage } from 'node:http';

import { SpanKind } from '@opentelemetry/api';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SUBMIT_SPAN_NAME } from './form_service';
import { createApiApp } from '../../app';
import { createContainer } from '../../common/ioc/container';
import { createJsonLogger } from '../../common/logging/logger';
import { initTelemetry, resetTelemetry } from '../../telemetry/provider';

import type { AppConfig, TelemetryConfig } from '../../common/config/types';
import type { AddressInfo } from 'node:net';


type Call = { method: string; url: string; headers: IncomingMessage['headers']; bytes: number };

const BOUNDARY = 'nikkiBoundary42';
const UPLOAD_PATH = '/v1/itstorage/files/upload';
const CHUNK = Buffer.alloc(64 * 1024, 0x61);
const BIG_FILE_BYTES = 256 * CHUNK.length;
const UPSTREAM_PAUSE_MS = 400;
const TELEMETRY_CONFIG: TelemetryConfig = {
	serviceName: 'coremart-bff', serviceVersion: 'test', deploymentEnvironment: 'test', serviceInstanceId: 'i-1',
	resourceAttributes: {}, propagators: ['tracecontext', 'baggage'], sampler: 'parentbased_traceidratio',
	samplerArg: 1, exporter: 'none', otlpProtocol: 'http/json', otlpEndpoint: '',
	batch: { maxQueueSize: 10, maxExportBatchSize: 5, scheduledDelayMillis: 10, exportTimeoutMillis: 100 },
	baggageAllowlist: [], shutdownFlushMs: 100,
};

const exporter = new InMemorySpanExporter();
let calls: Call[] = [];
let uploadCount = 0;
/** Resolves when the slow upstream starts reading again after its pause. */
let onUpstreamResume: (() => void) | undefined;

// A Storage that stops reading the first upload for a while: an unbuffered BFF must stall the browser meanwhile.
const upstream = http.createServer((req, res) => {
	let bytes = 0;
	let paused = false;
	req.on('data', (chunk: Buffer) => {
		bytes += chunk.length;
		if (!paused && req.url === UPLOAD_PATH && onUpstreamResume) {
			paused = true;
			req.pause();
			setTimeout(() => {
				onUpstreamResume?.();
				req.resume();
			}, UPSTREAM_PAUSE_MS);
		}
	});
	req.on('end', () => {
		calls.push({ method: req.method!, url: req.url!, headers: req.headers, bytes });
		const body = req.url === UPLOAD_PATH ? { id: `F${++uploadCount}` } : { affected_count: 1 };
		res.writeHead(req.url === UPLOAD_PATH ? 201 : 200, { 'content-type': 'application/json' });
		res.end(JSON.stringify(body));
	});
});
let bff: http.Server;
let bffPort = 0;

function listen(server: http.Server): Promise<number> {
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port)));
}

function buildConfig(upstreamPort: number): AppConfig {
	return {
		nodeEnv: 'test', isLocal: false, clientRootPath: '', clientConfig: { BASE_API_URL: '/api' },
		http: { host: '', port: '0', httpsEnabled: false, certificateFile: '', privateKeyFile: '' },
		upstream: {
			baseUrl: new URL(`http://127.0.0.1:${upstreamPort}`), forwardHost: false, timeoutMs: 5000,
			tls: { caFiles: [], insecure: false },
		},
		cookie: { secure: false },
		corsOrigins: [],
		schemaCacheTtlMins: 30,
	};
}

function fileHead(name: string): string {
	return `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"; filename="${name}.bin"\r\n`
		+ 'Content-Type: application/octet-stream\r\n\r\n';
}

function payloadPart(sizes: Record<string, number>): string {
	const payload = JSON.stringify({ etag: 'E1', __file_sizes: sizes });
	return `--${BOUNDARY}\r\nContent-Disposition: form-data; name="payload"\r\n\r\n${payload}\r\n`;
}

type SendResult = { status: number; headers: IncomingMessage['headers']; sentWhenResumed: number };

/** Writes the form honouring backpressure and records how much was accepted before the upstream resumed. */
function sendForm(parts: Array<string | number>, slowUpstream = false): Promise<SendResult> {
	let sent = 0;
	let sentWhenResumed = -1;
	onUpstreamResume = slowUpstream ? () => {
		sentWhenResumed = sent;
	} : undefined;
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: '127.0.0.1', port: bffPort, path: '/api/v1/iam/iam_user/U1', method: 'PATCH',
			headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}`, 'sec-fetch-site': 'same-origin' },
		}, (response) => {
			response.resume();
			response.on('end', () => resolve({ status: response.statusCode!, headers: response.headers, sentWhenResumed }));
		});
		request.on('error', reject);
		void writeParts(request, parts, (bytes) => {
			sent += bytes;
		});
	});
}

/** A number is a file body of that many bytes, written chunk by chunk; a string is written as is. */
async function writeParts(request: http.ClientRequest, parts: Array<string | number>, count: (n: number) => void) {
	for (const part of parts) {
		if (typeof part === 'string') {
			await writeChunk(request, Buffer.from(part), count);
			continue;
		}
		for (let offset = 0; offset < part; offset += CHUNK.length) {
			await writeChunk(request, CHUNK.subarray(0, Math.min(CHUNK.length, part - offset)), count);
		}
	}
	request.end();
}

function writeChunk(request: http.ClientRequest, chunk: Buffer, count: (n: number) => void): Promise<void> {
	count(chunk.length);
	return request.write(chunk) ? Promise.resolve() : new Promise((resolve) => request.once('drain', resolve));
}

beforeAll(async () => {
	const spanProcessors = [new SimpleSpanProcessor(exporter)];
	initTelemetry(TELEMETRY_CONFIG, { spanProcessors, logger: createJsonLogger() });
	const logger = { ...createJsonLogger(), warn: () => undefined };
	bff = http.createServer(createApiApp(createContainer(buildConfig(await listen(upstream)), { logger })));
	bffPort = await listen(bff);
});

afterAll(async () => {
	bff.close();
	upstream.close();
	await resetTelemetry();
});

beforeEach(() => {
	calls = [];
	uploadCount = 0;
	onUpstreamResume = undefined;
	exporter.reset();
});

describe('resource forms telemetry', () => {
	it('AC-16: keeps streaming under a slow Storage, the browser is held back instead of buffered', async () => {
		const sizes = { avatar_file_id: BIG_FILE_BYTES };
		const parts = [payloadPart(sizes), fileHead('avatar_file_id'), BIG_FILE_BYTES, `\r\n--${BOUNDARY}--\r\n`];
		const result = await sendForm(parts, true);

		expect(result.status).toBe(200);
		expect(result.sentWhenResumed).toBeGreaterThan(0);
		// A buffering BFF would have taken the whole 16 MiB while Storage was not reading.
		expect(result.sentWhenResumed).toBeLessThan(BIG_FILE_BYTES / 2);
		const [upload] = calls.filter((call) => call.url === UPLOAD_PATH);
		expect(upload.bytes).toBeGreaterThan(BIG_FILE_BYTES);
	});

	it('ID-AC-10: every upload and the resource write share one id and one trace, each its own span', async () => {
		const sizes = { avatar_file_id: 3, cover_file_id: 3 };
		const parts = [payloadPart(sizes), fileHead('avatar_file_id'), 'AAA\r\n', fileHead('cover_file_id'), 'BBB\r\n',
			`--${BOUNDARY}--\r\n`];
		const result = await sendForm(parts);

		expect(result.status).toBe(200);
		const id = result.headers['x-idempotency-id'];
		const traceId = result.headers['x-trace-id'];
		expect(calls).toHaveLength(3);
		const parents = calls.map((call) => String(call.headers.traceparent).split('-'));
		expect(calls.map((call) => call.headers['x-idempotency-id'])).toEqual([id, id, id]);
		expect(parents.map(([, trace]) => trace)).toEqual([traceId, traceId, traceId]);
		expect(new Set(parents.map(([, , spanId]) => spanId)).size).toBe(3);

		await new Promise((resolve) => setTimeout(resolve, 20));
		const spans = exporter.getFinishedSpans();
		const submit = spans.find((span) => span.name === SUBMIT_SPAN_NAME)!;
		const clients = spans.filter((span) => span.kind === SpanKind.CLIENT);
		expect(submit.kind).toBe(SpanKind.INTERNAL);
		expect(clients).toHaveLength(3);
		expect(clients.every((span) => span.parentSpanContext?.spanId === submit.spanContext().spanId)).toBe(true);
		expect(clients.map((span) => span.spanContext().spanId).sort())
			.toEqual(parents.map(([, , spanId]) => spanId).sort());
		expect(new Set(spans.map((span) => span.spanContext().traceId))).toEqual(new Set([traceId]));
	});
});
