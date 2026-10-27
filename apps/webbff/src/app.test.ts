import http, { type IncomingMessage } from 'node:http';


import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApiApp } from './app';
import { createContainer } from './common/ioc/container';

import type { AppConfig } from './common/config/types';
import type { AddressInfo } from 'node:net';


type Captured = { method?: string; url?: string; headers: IncomingMessage['headers']; body: string };

let captured: Captured | undefined;
const upstream = http.createServer((req, res) => {
	const chunks: Buffer[] = [];
	req.on('data', (chunk: Buffer) => chunks.push(chunk));
	req.on('end', () => {
		captured = { method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks).toString() };
		res.writeHead(201, { 'content-type': 'application/json', 'set-cookie': 'up=1', 'x-nikki-trace': 't1' });
		res.end('{"ok":true}');
	});
});
let bff: http.Server;
let bffUrl = '';

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

beforeAll(async () => {
	const upstreamPort = await listen(upstream);
	bff = http.createServer(createApiApp(createContainer(buildConfig(upstreamPort))));
	bffUrl = `http://127.0.0.1:${await listen(bff)}`;
});

afterAll(() => {
	bff.close();
	upstream.close();
});

describe('webbff api app', () => {
	it('serves the public config under /api/v0/config', async () => {
		const res = await fetch(`${bffUrl}/api/v0/config`);
		expect(await res.json()).toEqual({ BASE_API_URL: '/api' });
	});

	it('forwards path, query, body and the cookie token, and filters response headers', async () => {
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user?page=0`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json', cookie: 'nikki_at=tok', authorization: 'Bearer x',
				'x-nikki-accesstoken': 'forged', 'x-nikki-org-id': 'o1', 'sec-fetch-site': 'same-origin',
			},
			body: '{"a":1}',
		});
		expect(res.status).toBe(201);
		expect(await res.json()).toEqual({ ok: true });
		expect(res.headers.get('set-cookie')).toBeNull();
		expect(res.headers.get('x-nikki-trace')).toBe('t1');
		expect(captured).toMatchObject({ method: 'POST', url: '/v1/iam/iam_user?page=0', body: '{"a":1}' });
		expect(captured?.headers).toMatchObject({
			host: new URL(bffUrl.replace(/:\d+$/, `:${(upstream.address() as AddressInfo).port}`)).host,
			'x-nikki-accesstoken': 'tok',
			'x-nikki-org-id': 'o1',
		});
		expect(captured?.headers).not.toHaveProperty('authorization');
		expect(captured?.headers).not.toHaveProperty('cookie');
	});

	it('answers 404 with an error array outside /api/v{n}/', async () => {
		const res = await fetch(`${bffUrl}/api/foo`);
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_not_found' })]);
	});

	it('answers 502 with an error array when the upstream is down', async () => {
		const deadServer = http.createServer(createApiApp(createContainer(buildConfig(1))));
		const port = await listen(deadServer);
		const res = await fetch(`http://127.0.0.1:${port}/api/v1/essential/essential_language/enabled`);
		deadServer.close();
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual([
			{ type: 'business', key: 'common:err_upstream_unavailable', message: expect.any(String) },
		]);
	});
});

describe('webbff csrf guard', () => {
	it('rejects a cross-site write carrying a session cookie before it reaches the upstream', async () => {
		captured = undefined;
		const res = await fetch(`${bffUrl}/api/v1/iam/iam_user`, {
			method: 'POST', headers: { cookie: 'nikki_at=tok', origin: 'https://evil.test' }, body: '{}',
		});
		expect(res.status).toBe(403);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_csrf_rejected' })]);
		expect(captured).toBeUndefined();
	});
});
