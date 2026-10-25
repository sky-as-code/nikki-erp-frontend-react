import { describe, expect, it, vi } from 'vitest';

import { createCsrfGuard, ERR_CSRF_REJECTED, isCsrfSafe } from './csrf';

import type { Request, Response } from 'express';
import type { IncomingHttpHeaders, IncomingMessage } from 'node:http';


function fakeRequest(method: string, headers: IncomingHttpHeaders): IncomingMessage {
	return { method, headers: { host: 'shop.example.com', ...headers } } as IncomingMessage;
}

const session = { cookie: 'nikki_at=tok' };

describe('isCsrfSafe', () => {
	it.each([
		['GET with a session cookie', 'GET', { ...session, 'sec-fetch-site': 'cross-site' }, true],
		['HEAD with a session cookie', 'HEAD', { ...session }, true],
		['OPTIONS with a session cookie', 'OPTIONS', { ...session }, true],
		['POST without a session cookie', 'POST', { cookie: 'other=1', 'sec-fetch-site': 'cross-site' }, true],
		['POST without any cookie', 'POST', {}, true],
		['POST same-origin', 'POST', { ...session, 'sec-fetch-site': 'same-origin' }, true],
		['POST user-initiated (none)', 'POST', { cookie: 'nikki_rt=r', 'sec-fetch-site': 'none' }, true],
		['DELETE with Origin matching Host', 'DELETE', { ...session, origin: 'https://shop.example.com' }, true],
		['POST cross-site', 'POST', { ...session, 'sec-fetch-site': 'cross-site' }, false],
		['POST same-site sibling', 'POST', {
			...session, 'sec-fetch-site': 'same-site', origin: 'https://evil.example.com',
		}, false],
		['PATCH with foreign Origin', 'PATCH', { ...session, origin: 'https://evil.test' }, false],
		['POST with Origin null', 'POST', { ...session, origin: 'null' }, false],
		['POST with neither header', 'POST', { cookie: 'nikki_rt=r' }, false],
		['PUT with Origin on another port', 'PUT', { ...session, origin: 'https://shop.example.com:8443' }, false],
	])('%s → %s', (_name, method, headers, expected) => {
		expect(isCsrfSafe(fakeRequest(method, headers))).toBe(expected);
	});
});

describe('createCsrfGuard', () => {
	it('answers 403 with the error array when rejected', () => {
		const writeHead = vi.fn();
		const end = vi.fn();
		const next = vi.fn();
		const req = fakeRequest('POST', { ...session, origin: 'https://evil.test' }) as Request;
		createCsrfGuard()(req, { writeHead, end } as unknown as Response, next);
		expect(next).not.toHaveBeenCalled();
		expect(writeHead).toHaveBeenCalledWith(403, expect.anything());
		expect(JSON.parse(end.mock.calls[0][0] as string)).toEqual([
			{ type: 'authorization', key: ERR_CSRF_REJECTED, message: expect.any(String) },
		]);
	});

	it('calls next when allowed', () => {
		const next = vi.fn();
		createCsrfGuard()(fakeRequest('POST', {}) as Request, {} as Response, next);
		expect(next).toHaveBeenCalledWith();
	});
});
