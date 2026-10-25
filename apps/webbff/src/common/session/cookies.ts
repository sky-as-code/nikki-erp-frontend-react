import { parseCookie, type SerializeOptions, stringifySetCookie } from 'cookie';

import type { IncomingMessage, ServerResponse } from 'node:http';



export const ACCESS_TOKEN_COOKIE = 'nikki_at';
export const REFRESH_TOKEN_COOKIE = 'nikki_rt';
export const ACCESS_TOKEN_COOKIE_PATH = '/api';
// Scoped to the signin group, not only `/refresh`, so that `/signout` also receives it and can clear it.
export const REFRESH_TOKEN_COOKIE_PATH = '/api/v1/iam/signin';

export interface SessionTokens {
	readonly accessToken: string;
	/** ISO-8601 date-time from the business service. */
	readonly accessExpiresAt: string;
	readonly refreshToken: string;
	/** ISO-8601 date-time from the business service. */
	readonly refreshExpiresAt: string;
}

export interface SessionCookies {
	readAccessToken(req: IncomingMessage): string | undefined;
	readRefreshToken(req: IncomingMessage): string | undefined;
	setTokens(res: ServerResponse, tokens: SessionTokens): void;
	clear(res: ServerResponse): void;
}

export interface SessionCookieOptions {
	readonly secure: boolean;
}

export function createSessionCookies(options: SessionCookieOptions): SessionCookies {
	return {
		readAccessToken: (req) => readCookie(req, ACCESS_TOKEN_COOKIE),
		readRefreshToken: (req) => readCookie(req, REFRESH_TOKEN_COOKIE),
		setTokens: (res, tokens) => setTokens(res, tokens, options),
		clear: (res) => clearTokens(res, options),
	};
}

function readCookie(req: IncomingMessage, name: string): string | undefined {
	const header = req.headers.cookie;
	if (!header) {
		return undefined;
	}
	return parseCookie(header)[name] || undefined;
}

function setTokens(res: ServerResponse, tokens: SessionTokens, options: SessionCookieOptions): void {
	appendCookie(res, ACCESS_TOKEN_COOKIE, tokens.accessToken, {
		...baseAttributes(options, ACCESS_TOKEN_COOKIE_PATH),
		expires: parseExpiry(tokens.accessExpiresAt),
	});
	appendCookie(res, REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
		...baseAttributes(options, REFRESH_TOKEN_COOKIE_PATH),
		expires: parseExpiry(tokens.refreshExpiresAt),
	});
}

function clearTokens(res: ServerResponse, options: SessionCookieOptions): void {
	const expired = { expires: new Date(0), maxAge: 0 };
	appendCookie(res, ACCESS_TOKEN_COOKIE, '', { ...baseAttributes(options, ACCESS_TOKEN_COOKIE_PATH), ...expired });
	appendCookie(res, REFRESH_TOKEN_COOKIE, '', { ...baseAttributes(options, REFRESH_TOKEN_COOKIE_PATH), ...expired });
}

function baseAttributes(options: SessionCookieOptions, path: string): SerializeOptions {
	return { httpOnly: true, sameSite: 'strict', secure: options.secure, path };
}

function parseExpiry(isoDateTime: string): Date | undefined {
	const expiry = new Date(isoDateTime);
	return Number.isNaN(expiry.getTime()) ? undefined : expiry;
}

function appendCookie(res: ServerResponse, name: string, value: string, attributes: SerializeOptions): void {
	res.appendHeader('Set-Cookie', stringifySetCookie(name, value, attributes));
}
