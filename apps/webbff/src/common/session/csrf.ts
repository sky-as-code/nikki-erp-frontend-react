import { parseCookie } from 'cookie';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './cookies';
import { buildErrors, sendErrors } from '../http/errors';

import type { RequestHandler } from 'express';
import type { IncomingMessage } from 'node:http';


export const ERR_CSRF_REJECTED = 'common:err_csrf_rejected';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const TRUSTED_FETCH_SITES = new Set(['same-origin', 'none']);

/**
 * Backstop behind `SameSite=Strict`: a state-changing request that carries a session cookie must come from this
 * origin. Requests without a session cookie cannot act as the user, so they pass.
 */
export function createCsrfGuard(): RequestHandler {
	return (req, res, next) => {
		if (isCsrfSafe(req)) {
			next();
			return;
		}
		sendErrors(res, 403, buildErrors('authorization', ERR_CSRF_REJECTED, 'Cross-site request rejected'));
	};
}

export function isCsrfSafe(req: IncomingMessage): boolean {
	if (SAFE_METHODS.has(req.method ?? 'GET') || !hasSessionCookie(req)) {
		return true;
	}
	const fetchSite = headerValue(req, 'sec-fetch-site')?.toLowerCase();
	if (fetchSite && TRUSTED_FETCH_SITES.has(fetchSite)) {
		return true;
	}
	return isSameHostOrigin(headerValue(req, 'origin'), headerValue(req, 'host'));
}

function hasSessionCookie(req: IncomingMessage): boolean {
	const header = req.headers.cookie;
	if (!header) {
		return false;
	}
	const cookies = parseCookie(header);
	return Boolean(cookies[ACCESS_TOKEN_COOKIE] || cookies[REFRESH_TOKEN_COOKIE]);
}

function isSameHostOrigin(origin: string | undefined, host: string | undefined): boolean {
	if (!origin || !host) {
		return false;
	}
	try {
		return new URL(origin).host.toLowerCase() === host.toLowerCase();
	}
	catch {
		return false;
	}
}

function headerValue(req: IncomingMessage, name: string): string | undefined {
	const value = req.headers[name];
	return Array.isArray(value) ? value[0] : value;
}
