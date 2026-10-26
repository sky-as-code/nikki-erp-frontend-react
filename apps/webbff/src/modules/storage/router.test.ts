import http, { type IncomingMessage } from 'node:http';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../../app';
import { createContainer } from '../../common/ioc/container';
import { createConsoleLogger } from '../../common/logging/logger';

import type { AppConfig } from '../../common/config/types';
import type { AddressInfo } from 'node:net';


type Call = { method: string; url: string; headers: IncomingMessage['headers']; body: string };
type Reply = { status: number; body: unknown };

const BOUNDARY = 'nikkiBoundary42';
const MULTIPART_TYPE = `multipart/form-data; boundary=${BOUNDARY}`;
const TEXT_PARTS = `--${BOUNDARY}\r\nContent-Disposition: form-data; name="org_id"\r\n\r\nO1\r\n`
	+ `--${BOUNDARY}\r\nContent-Disposition: form-data; name="name"\r\n\r\na.png\r\n`;
const FILE_PART = `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="a.png"\r\n`
	+ `Content-Type: image/png\r\n\r\nPNGDATA\r\n--${BOUNDARY}--\r\n`;
const UPLOADED = { id: 'F1', etag: 'fe', created_at: '2026-01-01T00:00:00Z', file_path: 'org/o1/F1.png' };
const FILE_ROUTE = '/api/v0/iam/iam_user/U1/files/avatar';

let calls: Call[] = [];
let replies: Record<string, Reply> = {};
let onFirstUploadChunk: (() => void) | undefined;

const upstream = http.createServer((req, res) => {
	const chunks: Buffer[] = [];
	req.on('data', (chunk: Buffer) => {
		if (chunks.length === 0 && req.url?.startsWith('/v1/itstorage/files/upload')) {
			onFirstUploadChunk?.();
		}
		chunks.push(chunk);
	});
	req.on('end', () => {
		const body = Buffer.concat(chunks).toString();
		const call = { method: req.method!, url: req.url!, headers: req.headers, body };
		calls.push(call);
		const reply = replies[`${call.method} ${call.url.split('?', 1)[0]}`] ?? { status: 404, body: [] };
		res.writeHead(reply.status, { 'content-type': 'application/json' });
		res.end(JSON.stringify(reply.body));
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
			baseUrl: new URL(`http://127.0.0.1:${upstreamPort}`), forwardHost: false, timeoutMs: 2000,
			tls: { caFiles: [], insecure: false },
		},
		cookie: { secure: false },
		corsOrigins: [],
	};
}

type BffResponse = { status: number; body: unknown };

/** Sends the multipart in two writes; the second waits on `beforeFilePart`, if given. */
function sendMultipart(path: string, method: string, beforeFilePart?: Promise<void>): Promise<BffResponse> {
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: '127.0.0.1', port: bffPort, path, method,
			headers: { 'content-type': MULTIPART_TYPE, cookie: 'nikki_at=tok', 'sec-fetch-site': 'same-origin' },
		}, (response) => {
			const chunks: Buffer[] = [];
			response.on('data', (chunk: Buffer) => chunks.push(chunk));
			response.on('end', () => resolve({
				status: response.statusCode ?? 0, body: JSON.parse(Buffer.concat(chunks).toString() || 'null'),
			}));
		});
		request.on('error', reject);
		request.write(TEXT_PARTS);
		void (beforeFilePart ?? Promise.resolve()).then(() => request.end(FILE_PART));
	});
}

function callsTo(method: string, prefix: string): Call[] {
	return calls.filter((call) => call.method === method && call.url.startsWith(prefix));
}

beforeAll(async () => {
	const upstreamPort = await listen(upstream);
	const logger = { ...createConsoleLogger(), warn: () => undefined };
	bff = http.createServer(createApiApp(createContainer(buildConfig(upstreamPort), { logger })));
	bffPort = await listen(bff);
});

afterAll(() => {
	bff.close();
	upstream.close();
});

beforeEach(() => {
	calls = [];
	replies = {};
	onFirstUploadChunk = undefined;
});

describe('storage file field router', () => {
	it('streams the multipart to Storage unbuffered, then writes the file path on the record', async () => {
		replies = {
			'POST /v1/itstorage/files/upload': { status: 201, body: UPLOADED },
			'PATCH /v1/iam/iam_user/U1': { status: 200, body: { affected_count: 1, etag: 'e2' } },
		};
		// The file part is only sent once Storage has seen the first bytes: a buffering BFF would deadlock here.
		const uploadStarted = new Promise<void>((resolve) => {
			onFirstUploadChunk = resolve;
		});
		const res = await sendMultipart(`${FILE_ROUTE}?etag=E1&org_id=O1`, 'POST', uploadStarted);

		expect(res).toEqual({ status: 200, body: { affected_count: 1, etag: 'e2' } });
		const [upload] = callsTo('POST', '/v1/itstorage/files/upload');
		expect(upload.headers['content-type']).toBe(MULTIPART_TYPE);
		expect(upload.headers['x-nikki-accesstoken']).toBe('tok');
		expect(upload.body).toBe(TEXT_PARTS + FILE_PART);
		const [update] = callsTo('PATCH', '/v1/iam/iam_user/U1');
		expect(update.headers['content-type']).toBe('application/json');
		expect(JSON.parse(update.body)).toEqual({ avatar_file_path: UPLOADED.file_path, etag: 'E1', org_id: 'O1' });
	});

	it('deletes the uploaded file and returns the update error when the record update fails', async () => {
		const conflict = [{ type: 'business', key: 'common:err_etag_mismatch', message: 'stale' }];
		replies = {
			'POST /v1/itstorage/files/upload': { status: 201, body: UPLOADED },
			'PATCH /v1/iam/iam_user/U1': { status: 409, body: conflict },
			'DELETE /v1/itstorage/files/F1': { status: 200, body: { affected_count: 1 } },
		};
		const res = await sendMultipart(`${FILE_ROUTE}?etag=E1&org_id=O1`, 'PUT');

		expect(res).toEqual({ status: 409, body: conflict });
		expect(callsTo('DELETE', '/v1/itstorage/files/').map((call) => call.url)).toEqual([
			'/v1/itstorage/files/F1?org_id=O1',
		]);
	});

	it('passes a refused upload through without touching the record', async () => {
		const tooLarge = [{ type: 'business', key: 'itstorage:err_quota_exceeded', message: 'full' }];
		replies = { 'POST /v1/itstorage/files/upload': { status: 413, body: tooLarge } };
		const res = await sendMultipart(`${FILE_ROUTE}?etag=E1`, 'POST');

		expect(res).toEqual({ status: 413, body: tooLarge });
		expect(callsTo('PATCH', '/v1/')).toEqual([]);
	});
});

describe('storage file field router, clearing and guards', () => {
	it('clears the field on DELETE with a null file path', async () => {
		replies = { 'PATCH /v1/iam/iam_user/U1': { status: 200, body: { affected_count: 1, etag: 'e3' } } };
		const res = await fetch(`http://127.0.0.1:${bffPort}${FILE_ROUTE}?etag=E1&org_id=O1`, {
			method: 'DELETE', headers: { cookie: 'nikki_at=tok', 'sec-fetch-site': 'same-origin' },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ affected_count: 1, etag: 'e3' });
		expect(calls).toHaveLength(1);
		expect(JSON.parse(calls[0].body)).toEqual({ avatar_file_path: null, etag: 'E1', org_id: 'O1' });
	});

	it('refuses a request without etag before calling the upstream', async () => {
		const res = await fetch(`http://127.0.0.1:${bffPort}${FILE_ROUTE}`, { method: 'DELETE' });

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_malformed_request' })]);
		expect(calls).toEqual([]);
	});

	it('is behind the CSRF guard', async () => {
		const res = await fetch(`http://127.0.0.1:${bffPort}${FILE_ROUTE}?etag=E1`, {
			method: 'POST',
			headers: { 'content-type': MULTIPART_TYPE, cookie: 'nikki_at=tok', origin: 'https://evil.test' },
			body: TEXT_PARTS + FILE_PART,
		});

		expect(res.status).toBe(403);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_csrf_rejected' })]);
		expect(calls).toEqual([]);
	});
});
