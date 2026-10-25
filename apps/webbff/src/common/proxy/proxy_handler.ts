import { BFF_API_BASE_URL } from '../config/env';
import { sendNotFound } from '../http/errors';

import type { Container } from '../ioc/container';
import type { RequestHandler } from 'express';


export const API_PREFIX = BFF_API_BASE_URL;
// `/api/v0` belongs to the BFF itself (frontend-coupled, versionless) and is never forwarded.
const VERSIONED_PATH = /^\/v[1-9][0-9]*\//;
const DOT_SEGMENT = /^(\.|\.\.)$/;

/**
 * Maps a browser URL to the upstream path: `/api/v1/iam/iam_user?x=1` → `/v1/iam/iam_user?x=1`.
 * Returns undefined for anything outside `/api/v{n}/` (n >= 1) or carrying dot segments.
 */
export function toUpstreamPath(originalUrl: string): string | undefined {
	if (!originalUrl.startsWith(`${API_PREFIX}/`)) {
		return undefined;
	}
	const upstreamPath = originalUrl.substring(API_PREFIX.length);
	const pathname = upstreamPath.split('?', 1)[0];
	if (!VERSIONED_PATH.test(pathname) || hasDotSegment(pathname)) {
		return undefined;
	}
	return upstreamPath;
}

function hasDotSegment(pathname: string): boolean {
	return pathname.split('/').some((segment) => {
		try {
			const decoded = decodeURIComponent(segment);
			return DOT_SEGMENT.test(decoded) || decoded.includes('\\');
		}
		catch {
			return true;
		}
	});
}

/** Generic proxy mounted last under `/api`: forwards every versioned path verbatim to the business service. */
export function createProxyHandler(container: Container): RequestHandler {
	return (req, res) => {
		const upstreamPath = toUpstreamPath(req.originalUrl);
		if (!upstreamPath) {
			sendNotFound(res);
			return;
		}
		container.upstream.forward(req, res, {
			upstreamPath,
			accessToken: container.sessionCookies.readAccessToken(req),
		});
	};
}
