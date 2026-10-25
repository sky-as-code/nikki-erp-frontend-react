import { describe, expect, it } from 'vitest';

import { createSessionCookies } from './cookies';

import type { IncomingMessage, ServerResponse } from 'node:http';


function fakeResponse(): { res: ServerResponse; cookies: string[] } {
	const cookies: string[] = [];
	const res = { appendHeader: (_name: string, value: string) => cookies.push(value) } as unknown as ServerResponse;
	return { res, cookies };
}

const tokens = {
	accessToken: 'at-value',
	accessExpiresAt: '2026-10-25T10:05:00Z',
	refreshToken: 'rt-value',
	refreshExpiresAt: '2026-10-26T10:00:00Z',
};

describe('SessionCookies', () => {
	it('sets hardened host-only cookies scoped to their paths', () => {
		const { res, cookies } = fakeResponse();
		createSessionCookies({ secure: true }).setTokens(res, tokens);
		expect(cookies).toEqual([
			'nikki_at=at-value; Path=/api; Expires=Sun, 25 Oct 2026 10:05:00 GMT; HttpOnly; Secure; SameSite=Strict',
			'nikki_rt=rt-value; Path=/api/v1/iam/signin; Expires=Mon, 26 Oct 2026 10:00:00 GMT; HttpOnly; Secure; '
				+ 'SameSite=Strict',
		]);
		expect(cookies.join()).not.toContain('Domain');
	});

	it('omits Secure when disabled', () => {
		const { res, cookies } = fakeResponse();
		createSessionCookies({ secure: false }).setTokens(res, tokens);
		expect(cookies[0]).not.toContain('Secure');
	});

	it('clears both cookies on their own paths', () => {
		const { res, cookies } = fakeResponse();
		createSessionCookies({ secure: false }).clear(res);
		expect(cookies).toHaveLength(2);
		expect(cookies[0]).toMatch(/^nikki_at=; Max-Age=0; Path=\/api; Expires=Thu, 01 Jan 1970/);
		expect(cookies[1]).toMatch(/^nikki_rt=; Max-Age=0; Path=\/api\/v1\/iam\/signin; Expires=Thu, 01 Jan 1970/);
	});

	it('reads tokens from the Cookie header', () => {
		const req = { headers: { cookie: 'other=1; nikki_at=abc; nikki_rt=def' } } as IncomingMessage;
		const session = createSessionCookies({ secure: false });
		expect(session.readAccessToken(req)).toBe('abc');
		expect(session.readRefreshToken(req)).toBe('def');
		expect(session.readAccessToken({ headers: {} } as IncomingMessage)).toBeUndefined();
	});
});
