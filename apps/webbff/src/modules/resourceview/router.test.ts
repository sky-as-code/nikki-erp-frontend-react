import http from 'node:http';

import express from 'express';
import { afterEach, describe, expect, it } from 'vitest';

import { resourceViewRouterFactory } from './router';
import { createSchemaCache } from '../../common/cache/schema_cache';
import { UpstreamUnavailableError } from '../../common/http/errors';
import { createConsoleLogger } from '../../common/logging/logger';
import { createSessionCookies } from '../../common/session/cookies';

import type { ResourceViewRequest, ResourceViewService } from './resource_view_service';
import type { Container } from '../../common/ioc/container';
import type { AddressInfo } from 'node:net';


const SESSION = { cookie: 'nikki_at=tok' };
let server: http.Server | undefined;

afterEach(() => {
	server?.close();
	server = undefined;
});

function fakeContainer(): Container {
	return {
		config: {} as Container['config'],
		logger: { ...createConsoleLogger(), warn: () => undefined },
		upstream: {
			forward: () => undefined,
			pipeTo: () => Promise.reject(new Error('unused')),
			streamTo: () => Promise.reject(new Error('unused')),
			requestJson: () => Promise.reject(new Error('unused')),
		},
		sessionCookies: createSessionCookies({ secure: false }),
		schemaCache: createSchemaCache({ ttlMs: 0 }),
	};
}

async function startApp(read: ResourceViewService['read']): Promise<string> {
	const { basePath, router } = resourceViewRouterFactory(fakeContainer(), { read });
	const app = express();
	app.use(basePath, router);
	app.use((_req, res) => {
		res.status(418).end();
	});
	server = http.createServer(app);
	await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
	return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe('resourceViewRouterFactory', () => {
	it('serves a list with the parsed target, query and cookie token, no-store', async () => {
		let received: ResourceViewRequest | undefined;
		const baseUrl = await startApp(async (request) => {
			received = request;
			return { status: 200, body: { items: [], edge_labels: {} } };
		});
		const res = await fetch(`${baseUrl}/api/v1/list/iam/iam_user?org_id=o1&fields=a&fields=b`, { headers: SESSION });
		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(await res.json()).toEqual({ items: [], edge_labels: {} });
		expect(received?.target).toMatchObject({ kind: 'list', moduleKey: 'iam', schemaName: 'iam_user' });
		expect(received?.query.getAll('fields')).toEqual(['a', 'b']);
		expect(received?.accessToken).toBe('tok');
	});

	it('serves a detail of a nested resource', async () => {
		let received: ResourceViewRequest | undefined;
		const baseUrl = await startApp(async (request) => {
			received = request;
			return { status: 200, body: { item: {}, meta: {} } };
		});
		const res = await fetch(`${baseUrl}/api/v1/detail/iam/iam_org/o1/iam_orgunit/u1`, { headers: SESSION });
		expect(res.status).toBe(200);
		expect(received?.target).toMatchObject({
			kind: 'detail', segments: ['iam', 'iam_org', 'o1', 'iam_orgunit', 'u1'], schemaName: 'iam_orgunit',
		});
	});

	it('passes the service status and body through', async () => {
		const body = [{ type: 'authorization', key: 'k', message: 'm' }];
		const baseUrl = await startApp(async () => ({ status: 403, body }));
		const res = await fetch(`${baseUrl}/api/v1/list/iam/iam_user`, { headers: SESSION });
		expect(res.status).toBe(403);
		expect(await res.json()).toEqual(body);
	});

});

describe('resourceViewRouterFactory refusals', () => {
	it('answers 401 without the access-token cookie', async () => {
		const baseUrl = await startApp(() => Promise.reject(new Error('must not be called')));
		const res = await fetch(`${baseUrl}/api/v1/list/iam/iam_user`);
		expect(res.status).toBe(401);
		expect((await res.json())[0].key).toBe('common:err_unauthenticated');
	});

	it('answers 502 when the upstream is unreachable', async () => {
		const baseUrl = await startApp(() => Promise.reject(new UpstreamUnavailableError('down')));
		const res = await fetch(`${baseUrl}/api/v1/detail/iam/iam_user/u1`, { headers: SESSION });
		expect(res.status).toBe(502);
		expect((await res.json())[0].key).toBe('common:err_upstream_unavailable');
	});

	it.each(['/api/v1/list/iam', '/api/v1/detail/iam/iam_user', '/api/v1/list/iam/iam%2Fuser',
		'/api/v1/detail/iam/iam_user/%2E%2E', '/api/v1/list/IAM/iam_user'])('refuses %s with 404', async (path) => {
		const baseUrl = await startApp(() => Promise.reject(new Error('must not be called')));
		const res = await fetch(`${baseUrl}${path}`, { headers: SESSION });
		expect(res.status).toBe(404);
	});

	it('leaves other paths to the next handler', async () => {
		const baseUrl = await startApp(() => Promise.reject(new Error('must not be called')));
		const res = await fetch(`${baseUrl}/api/v1/iam/iam_user`, { headers: SESSION });
		expect(res.status).toBe(418);
	});
});
