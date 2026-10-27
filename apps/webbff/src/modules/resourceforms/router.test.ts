import http, { type IncomingMessage } from 'node:http';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApiApp } from '../../app';
import { createContainer } from '../../common/ioc/container';
import { createConsoleLogger } from '../../common/logging/logger';

import type { AppConfig } from '../../common/config/types';
import type { AddressInfo } from 'node:net';


type Call = { method: string; url: string; headers: IncomingMessage['headers']; body: string };
type Reply = { status: number; body: unknown };
type BffResponse = { status: number; body: unknown };

const BOUNDARY = 'nikkiBoundary42';
const MULTIPART_TYPE = `multipart/form-data; boundary=${BOUNDARY}`;
const SESSION_HEADERS = { cookie: 'nikki_at=tok', 'sec-fetch-site': 'same-origin' };
const UPLOAD_PATH = '/v1/itstorage/files/upload';

let calls: Call[] = [];
let replies: Record<string, Reply[]> = {};
let onFirstUploadChunk: (() => void) | undefined;

const upstream = http.createServer((req, res) => {
	const chunks: Buffer[] = [];
	req.on('data', (chunk: Buffer) => {
		if (chunks.length === 0 && req.url === UPLOAD_PATH) {
			onFirstUploadChunk?.();
		}
		chunks.push(chunk);
	});
	req.on('end', () => {
		const body = Buffer.concat(chunks).toString();
		const call = { method: req.method!, url: req.url!, headers: req.headers, body };
		calls.push(call);
		const reply = replies[`${call.method} ${call.url}`]?.shift() ?? { status: 404, body: [] };
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
		schemaCacheTtlMins: 30,
	};
}

function textPart(name: string, value: string): string {
	return `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
}

function filePart(name: string, filename: string, content: string): string {
	return `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\n`
		+ `Content-Type: image/png\r\n\r\n${content}\r\n`;
}

const CLOSING = `--${BOUNDARY}--\r\n`;

/** Sends `head`, then `tail` once `beforeTail` settles, so a test can prove the BFF streams. */
function send(path: string, method: string, head: string, tail = '', beforeTail?: Promise<void>): Promise<BffResponse> {
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: '127.0.0.1', port: bffPort, path, method,
			headers: { 'content-type': MULTIPART_TYPE, ...SESSION_HEADERS },
		}, (response) => {
			const chunks: Buffer[] = [];
			response.on('data', (chunk: Buffer) => chunks.push(chunk));
			response.on('end', () => resolve({
				status: response.statusCode ?? 0, body: JSON.parse(Buffer.concat(chunks).toString() || 'null'),
			}));
		});
		request.on('error', reject);
		request.write(head);
		void (beforeTail ?? Promise.resolve()).then(() => request.end(tail));
	});
}

function callsTo(method: string, url: string): Call[] {
	return calls.filter((call) => call.method === method && call.url === url);
}

function payloadPart(payload: Record<string, unknown>): string {
	return textPart('payload', JSON.stringify(payload));
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

describe('resource forms router, update with a file', () => {
	it('streams the file to Storage unbuffered and patches the record with its id', async () => {
		replies = {
			[`POST ${UPLOAD_PATH}`]: [{ status: 201, body: { id: 'F1', status: 'pending' } }],
			'PATCH /v1/iam/iam_user/U1': [{ status: 200, body: { affected_count: 1, etag: 'e2' } }],
		};
		// The file's last bytes are sent only once Storage has seen the first: a buffering BFF would deadlock.
		const uploadStarted = new Promise<void>((resolve) => {
			onFirstUploadChunk = resolve;
		});
		const payload = { etag: 'E1', org_id: 'O1', name: 'Ann', __file_sizes: { avatar_file_id: 14 } };
		const head = payloadPart(payload) + filePart('avatar_file_id', 'a.png', 'PNGDATA');
		const res = await send('/api/v1/iam/iam_user/U1', 'PATCH', head, `REST\r\n${CLOSING}`, uploadStarted);

		expect(res).toEqual({ status: 200, body: { affected_count: 1, etag: 'e2' } });
		const [upload] = callsTo('POST', UPLOAD_PATH);
		expect(upload.headers['x-nikki-accesstoken']).toBe('tok');
		expect(upload.headers['content-type']).toMatch(/^multipart\/form-data; boundary=/);
		const names = [...upload.body.matchAll(/name="([a-z_]+)"/g)].map((match) => match[1]);
		expect(names).toEqual(['org_id', 'name', 'mime_type', 'size_bytes', 'file']);
		expect(upload.body).toContain('name="size_bytes"\r\n\r\n14\r\n');
		expect(upload.body).toContain('filename="a.png"\r\nContent-Type: image/png\r\n\r\nPNGDATA\r\nREST\r\n--');
		const [update] = callsTo('PATCH', '/v1/iam/iam_user/U1');
		expect(update.headers['content-type']).toBe('application/json');
		expect(JSON.parse(update.body)).toEqual({ etag: 'E1', org_id: 'O1', name: 'Ann', avatar_file_id: 'F1' });
	});

	it('uploads every file of a create and keeps a cleared field null', async () => {
		replies = {
			[`POST ${UPLOAD_PATH}`]: [{ status: 201, body: { id: 'F1' } }, { status: 201, body: { id: 'F2' } }],
			'POST /v1/vendingmachine/vdmc_brand': [{ status: 201, body: { id: 'B1', etag: 'e1' } }],
		};
		const sizes = { default_logo_file_id: 1, footer_logo_file_id: 1 };
		const body = payloadPart({ name: 'B', header_logo_file_id: null, __file_sizes: sizes })
			+ filePart('default_logo_file_id', 'd.png', 'D') + filePart('footer_logo_file_id', 'f.png', 'F') + CLOSING;
		const res = await send('/api/v1/vendingmachine/vdmc_brand', 'POST', body);

		expect(res).toEqual({ status: 201, body: { id: 'B1', etag: 'e1' } });
		expect(callsTo('POST', UPLOAD_PATH)).toHaveLength(2);
		const [create] = callsTo('POST', '/v1/vendingmachine/vdmc_brand');
		expect(JSON.parse(create.body)).toEqual({
			name: 'B', header_logo_file_id: null, default_logo_file_id: 'F1', footer_logo_file_id: 'F2',
		});
	});
});

describe('resource forms router, failures', () => {
	it('returns a refused upload without writing the record', async () => {
		const tooLarge = [{ type: 'business', key: 'itstorage:err_quota_exceeded', message: 'full' }];
		replies = { [`POST ${UPLOAD_PATH}`]: [{ status: 413, body: tooLarge }] };
		const body = payloadPart({ etag: 'E1', __file_sizes: { avatar_file_id: 1 } })
			+ filePart('avatar_file_id', 'a.png', 'P') + CLOSING;
		const res = await send('/api/v1/iam/iam_user/U1', 'PATCH', body);

		expect(res).toEqual({ status: 413, body: tooLarge });
		expect(callsTo('PATCH', '/v1/iam/iam_user/U1')).toEqual([]);
	});

	it('refuses a file sent before the payload, or without its size, before calling Storage', async () => {
		const early = await send('/api/v1/iam/iam_user/U1', 'PATCH', filePart('avatar_file_id', 'a.png', 'P') + CLOSING);
		const noSize = await send('/api/v1/iam/iam_user/U1', 'PATCH',
			payloadPart({ etag: 'E1' }) + filePart('avatar_file_id', 'a.png', 'P') + CLOSING);

		for (const res of [early, noSize]) {
			expect(res.status).toBe(400);
			expect(res.body).toEqual([expect.objectContaining({ key: 'common:err_malformed_request' })]);
		}
		expect(calls).toEqual([]);
	});

	it('is behind the CSRF guard', async () => {
		const res = await fetch(`http://127.0.0.1:${bffPort}/api/v1/iam/iam_user/U1`, {
			method: 'PATCH',
			headers: { 'content-type': MULTIPART_TYPE, cookie: 'nikki_at=tok', origin: 'https://evil.test' },
			body: payloadPart({ etag: 'E1' }) + CLOSING,
		});

		expect(res.status).toBe(403);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_csrf_rejected' })]);
		expect(calls).toEqual([]);
	});
});

describe('resource forms router, pass-through', () => {
	it('proxies a JSON write unchanged', async () => {
		replies = { 'PATCH /v1/iam/iam_user/U1': [{ status: 200, body: { etag: 'e2' } }] };
		const res = await fetch(`http://127.0.0.1:${bffPort}/api/v1/iam/iam_user/U1`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json', ...SESSION_HEADERS },
			body: JSON.stringify({ etag: 'E1', avatar_file_id: null }),
		});

		expect(res.status).toBe(200);
		expect(calls).toHaveLength(1);
		expect(JSON.parse(calls[0].body)).toEqual({ etag: 'E1', avatar_file_id: null });
	});

	it('leaves Storage\'s own multipart routes to the proxy', async () => {
		replies = { 'POST /v1/itstorage/itstorage_file': [{ status: 201, body: { id: 'F9' } }] };
		const body = filePart('file', 'a.png', 'P') + CLOSING;
		const res = await send('/api/v1/itstorage/itstorage_file', 'POST', body);

		expect(res).toEqual({ status: 201, body: { id: 'F9' } });
		expect(calls).toHaveLength(1);
		expect(calls[0].headers['content-type']).toBe(MULTIPART_TYPE);
		expect(calls[0].body).toBe(body);
	});
});
