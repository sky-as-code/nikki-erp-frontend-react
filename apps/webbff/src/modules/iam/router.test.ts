import http from 'node:http';

import express from 'express';
import { afterEach, describe, expect, it } from 'vitest';

import { createBootstrapService } from './bootstrap_service';
import { createIamRouter } from './router';
import { createSigninService } from './signin_service';
import { UpstreamUnavailableError } from '../../common/http/errors';
import { createSessionCookies } from '../../common/session/cookies';

import type { RequestJsonOptions, UpstreamClient, UpstreamJsonResponse } from '../../common/http/upstream_client';
import type { AddressInfo } from 'node:net';


type Call = { method: string; path: string; options?: RequestJsonOptions };
type Reply = { status: number; body?: unknown } | Error;

const tokens = {
	access_token: 'at-new',
	access_token_expires_at: '2026-10-25T10:05:00Z',
	refresh_token: 'rt-new',
	refresh_token_expires_at: '2026-10-26T10:00:00Z',
};
const expiries = {
	access_token_expires_at: tokens.access_token_expires_at,
	refresh_token_expires_at: tokens.refresh_token_expires_at,
};

let server: http.Server | undefined;

function fakeUpstream(replies: Record<string, Reply>, calls: Call[]): UpstreamClient {
	return {
		forward: () => undefined,
		requestJson: async <T>(method: string, path: string, options?: RequestJsonOptions) => {
			calls.push({ method, path, options });
			const reply = replies[path];
			if (reply instanceof Error) {
				throw reply;
			}
			const headers = { 'content-type': 'application/json' };
			return { status: reply.status, headers, body: reply.body } as UpstreamJsonResponse<T>;
		},
	};
}

async function startBff(replies: Record<string, Reply>, calls: Call[] = []): Promise<string> {
	const upstream = fakeUpstream(replies, calls);
	const { basePath, router } = createIamRouter({
		signin: createSigninService({ upstream }),
		bootstrap: createBootstrapService({ upstream }),
		sessionCookies: createSessionCookies({ secure: true }),
	});
	const app = express();
	app.use(basePath, router);
	app.use((_req, res) => res.status(299).send('proxied'));
	server = http.createServer(app);
	await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
	return `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/iam`;
}

function post(url: string, init: { body?: string; cookie?: string } = {}): Promise<Response> {
	const headers: Record<string, string> = { 'content-type': 'application/json', 'user-agent': 'test-agent' };
	if (init.cookie) {
		headers.cookie = init.cookie;
	}
	return fetch(url, { method: 'POST', headers, body: init.body });
}

function expectCleared(res: Response): void {
	const cookies = res.headers.getSetCookie();
	expect(cookies).toHaveLength(2);
	expect(cookies[0]).toMatch(/^nikki_at=; Max-Age=0; Path=\/api;/);
	expect(cookies[1]).toMatch(/^nikki_rt=; Max-Age=0; Path=\/api\/v1\/iam\/signin;/);
}

afterEach(() => {
	server?.close();
	server = undefined;
});

describe('POST /signin/continue', () => {
	it('moves the tokens into hardened cookies and returns only the expiries', async () => {
		const calls: Call[] = [];
		const base = await startBff({ '/v1/iam/signin/continue': { status: 200, body: { done: true, data: tokens } } }, calls);
		const res = await post(`${base}/signin/continue`, { body: '{"attempt_id":"a1","passwords":{"password":"x"}}' });
		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(await res.json()).toEqual({ done: true, data: expiries });
		expect(res.headers.getSetCookie()).toEqual([
			'nikki_at=at-new; Path=/api; Expires=Sun, 25 Oct 2026 10:05:00 GMT; HttpOnly; Secure; SameSite=Strict',
			'nikki_rt=rt-new; Path=/api/v1/iam/signin; Expires=Mon, 26 Oct 2026 10:00:00 GMT; HttpOnly; Secure; '
				+ 'SameSite=Strict',
		]);
		expect(calls[0].options?.body).toEqual({ attempt_id: 'a1', passwords: { password: 'x' } });
		expect(calls[0].options?.incomingReq?.headers['user-agent']).toBe('test-agent');
	});

	it('passes an unfinished step through untouched', async () => {
		const body = { done: false, next_step: 'otp' };
		const base = await startBff({ '/v1/iam/signin/continue': { status: 200, body } });
		const res = await post(`${base}/signin/continue`, { body: '{}' });
		expect(await res.json()).toEqual(body);
		expect(res.headers.getSetCookie()).toEqual([]);
	});

	it('passes upstream errors through', async () => {
		const errors = [{ type: 'validation', key: 'err_wrong_password', message: 'x' }];
		const base = await startBff({ '/v1/iam/signin/continue': { status: 400, body: errors } });
		const res = await post(`${base}/signin/continue`, { body: '{}' });
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual(errors);
	});

	it('never leaks a finished body whose tokens are incomplete', async () => {
		const partial = { done: true, data: { access_token: 'leak' } };
		const base = await startBff({ '/v1/iam/signin/continue': { status: 200, body: partial } });
		const res = await post(`${base}/signin/continue`, { body: '{}' });
		expect(res.status).toBe(502);
		expect(await res.text()).not.toContain('leak');
	});

	it('answers malformed JSON with a 400 error array', async () => {
		const base = await startBff({});
		const res = await post(`${base}/signin/continue`, { body: '{oops' });
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_malformed_request' })]);
	});
});

describe('POST /signin/refresh', () => {
	it('answers 401 without calling upstream when the refresh cookie is missing', async () => {
		const calls: Call[] = [];
		const base = await startBff({}, calls);
		const res = await post(`${base}/signin/refresh`);
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual([
			{ type: 'authorization', key: 'common:err_unauthenticated', message: expect.any(String) },
		]);
		expect(calls).toEqual([]);
	});

	it('clears both cookies and answers 401 when upstream refuses', async () => {
		const refused = [{ type: 'validation', key: 'err_invalid_refresh_token', message: 'x' }];
		const base = await startBff({ '/v1/iam/signin/refresh': { status: 400, body: refused } });
		const res = await post(`${base}/signin/refresh`, { cookie: 'nikki_rt=rt-old' });
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual([expect.objectContaining({ key: 'common:err_unauthenticated' })]);
		expectCleared(res);
	});

	it('rotates both cookies from the refresh cookie, ignoring the body', async () => {
		const calls: Call[] = [];
		const base = await startBff({ '/v1/iam/signin/refresh': { status: 200, body: tokens } }, calls);
		const res = await post(`${base}/signin/refresh`, { cookie: 'nikki_rt=rt-old', body: '{"refresh_token":"x"}' });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual(expiries);
		expect(calls[0].options?.body).toEqual({ refresh_token: 'rt-old' });
		const cookies = res.headers.getSetCookie();
		expect(cookies[0]).toMatch(/^nikki_at=at-new; Path=\/api;/);
		expect(cookies[1]).toMatch(/^nikki_rt=rt-new; Path=\/api\/v1\/iam\/signin;/);
	});

	it('passes a 5xx through and keeps the cookies', async () => {
		const base = await startBff({ '/v1/iam/signin/refresh': { status: 503, body: [{ key: 'down' }] } });
		const res = await post(`${base}/signin/refresh`, { cookie: 'nikki_rt=rt-old' });
		expect(res.status).toBe(503);
		expect(await res.json()).toEqual([{ key: 'down' }]);
		expect(res.headers.getSetCookie()).toEqual([]);
	});

	it('answers 502 when upstream is unreachable', async () => {
		const base = await startBff({ '/v1/iam/signin/refresh': new UpstreamUnavailableError('down') });
		const res = await post(`${base}/signin/refresh`, { cookie: 'nikki_rt=rt-old' });
		expect(res.status).toBe(502);
		expect(res.headers.get('cache-control')).toBe('no-store');
	});
});

describe('POST /signin/signout', () => {
	it('clears both cookies and answers 204', async () => {
		const base = await startBff({});
		const res = await post(`${base}/signin/signout`, { cookie: 'nikki_rt=rt; nikki_at=at' });
		expect(res.status).toBe(204);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expectCleared(res);
	});
});

describe('GET /me/bootstrap', () => {
	const context = '/v1/iam/me/context';
	const languages = '/v1/essential/essential_language/enabled';
	const modules = '/v1/essential/essential_module_metadata?fields=*&page=0&size=500';

	it('merges the three upstream answers', async () => {
		const calls: Call[] = [];
		const base = await startBff({
			[context]: { status: 200, body: { user: 'u1' } },
			[languages]: { status: 200, body: [{ code: 'en' }] },
			[modules]: { status: 200, body: { items: [{ name: 'iam' }], total: 1 } },
		}, calls);
		const res = await fetch(`${base}/me/bootstrap`, { headers: { cookie: 'nikki_at=at' } });
		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(await res.json()).toEqual({
			context: { user: 'u1' }, languages: [{ code: 'en' }], modules: [{ name: 'iam' }],
		});
		expect(calls.map((call) => call.options?.accessToken)).toEqual(['at', 'at', 'at']);
	});

	it('returns the first failing upstream answer as-is', async () => {
		const base = await startBff({
			[context]: { status: 200, body: {} },
			[languages]: { status: 403, body: [{ key: 'forbidden' }] },
			[modules]: { status: 500, body: [{ key: 'boom' }] },
		});
		const res = await fetch(`${base}/me/bootstrap`);
		expect(res.status).toBe(403);
		expect(await res.json()).toEqual([{ key: 'forbidden' }]);
	});
});

describe('fall-through', () => {
	it('leaves every other IAM path to the generic proxy', async () => {
		const base = await startBff({});
		expect((await post(`${base}/signin/start`, { body: '{}' })).status).toBe(299);
		expect((await fetch(`${base}/me/context`)).status).toBe(299);
		expect((await fetch(`${base}/signin/refresh`)).status).toBe(299);
	});
});
