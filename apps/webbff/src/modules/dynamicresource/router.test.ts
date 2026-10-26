import http from 'node:http';

import express from 'express';
import { afterEach, describe, expect, it } from 'vitest';

import { dynamicResourceRouterFactory } from './router';
import { UpstreamUnavailableError } from '../../common/http/errors';
import { createConsoleLogger } from '../../common/logging/logger';
import { createSessionCookies } from '../../common/session/cookies';

import type { SchemaGraphRequest, SchemaGraphResult, SchemaGraphService } from './schema_graph_service';
import type { Container } from '../../common/ioc/container';
import type { AddressInfo } from 'node:net';


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
	};
}

async function startApp(fetchGraph: SchemaGraphService['fetchGraph']): Promise<string> {
	const { basePath, router } = dynamicResourceRouterFactory(fakeContainer(), { fetchGraph });
	const app = express();
	app.use(basePath, router);
	app.use((_req, res) => {
		res.status(418).end();
	});
	server = http.createServer(app);
	await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
	return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe('dynamicResourceRouterFactory', () => {
	it('mounts under /api/v1 and answers the graph with no-store', async () => {
		let received: SchemaGraphRequest | undefined;
		const body = { schema: { name: 'iam_users' }, edges: {}, failed_edges: [] };
		const baseUrl = await startApp(async (request) => {
			received = request;
			return { status: 200, body };
		});
		const res = await fetch(`${baseUrl}/api/v1/iam/iam_users/meta/schema_graph?org_id=o1&x=2`, {
			headers: { cookie: 'nikki_at=tok' },
		});
		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(await res.json()).toEqual(body);
		expect(received).toMatchObject({
			moduleKey: 'iam', schemaName: 'iam_users', query: 'org_id=o1&x=2', accessToken: 'tok',
		});
	});

	it('passes a root failure through with its status and body', async () => {
		const failure: SchemaGraphResult = { status: 403, body: [{ type: 'authorization', key: 'k', message: 'm' }] };
		const baseUrl = await startApp(async () => failure);
		const res = await fetch(`${baseUrl}/api/v1/iam/iam_users/meta/schema_graph`);
		expect(res.status).toBe(403);
		expect(await res.json()).toEqual(failure.body);
	});

	it('answers 502 when the upstream is unreachable', async () => {
		const baseUrl = await startApp(() => Promise.reject(new UpstreamUnavailableError('down')));
		const res = await fetch(`${baseUrl}/api/v1/iam/iam_users/meta/schema_graph`);
		expect(res.status).toBe(502);
		expect((await res.json())[0].key).toBe('common:err_upstream_unavailable');
	});

	it.each(['/api/v1/IAM/iam_users/meta/schema_graph', '/api/v1/iam/iam-users/meta/schema_graph',
		'/api/v1/iam/iam%2Fusers/meta/schema_graph'])('refuses invalid path segments with 404: %s', async (path) => {
		const baseUrl = await startApp(() => Promise.reject(new Error('must not be called')));
		const res = await fetch(`${baseUrl}${path}`);
		expect(res.status).toBe(404);
		expect((await res.json())[0].key).toBe('common:err_not_found');
	});

	it('leaves other paths to the next handler', async () => {
		const baseUrl = await startApp(() => Promise.reject(new Error('must not be called')));
		const res = await fetch(`${baseUrl}/api/v1/iam/iam_users/meta/schema`);
		expect(res.status).toBe(418);
	});
});
