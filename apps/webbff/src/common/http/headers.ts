import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';


export const ACCESS_TOKEN_HEADER = 'x-nikki-accesstoken';

const CUSTOM_HEADER_PREFIX = 'x-nikki-';

const BODY_REQUEST_HEADERS = ['content-type', 'content-length', 'transfer-encoding'];

const REQUEST_HEADERS = new Set([
	...BODY_REQUEST_HEADERS, 'accept', 'accept-language', 'range', 'if-none-match', 'user-agent',
]);

const RESPONSE_HEADERS = new Set([
	'content-type', 'content-length', 'transfer-encoding', 'content-disposition', 'cache-control', 'etag',
	'accept-ranges', 'content-range', 'x-accel-buffering',
]);

// Never forwarded in either direction, whatever the allowlists say.
const BLOCKED_HEADERS = new Set([
	ACCESS_TOKEN_HEADER, 'authorization', 'cookie', 'set-cookie', 'connection', 'keep-alive',
	'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'upgrade', 'host',
]);

export interface UpstreamRequestHeaderOptions {
	/** False drops the body-framing headers, for requests whose body the BFF builds itself. */
	readonly keepBodyHeaders: boolean;
}

export function filterRequestHeaders(
	incoming: IncomingHttpHeaders, options: UpstreamRequestHeaderOptions,
): OutgoingHttpHeaders {
	return pickHeaders(incoming, (name) => {
		if (!options.keepBodyHeaders && BODY_REQUEST_HEADERS.includes(name)) {
			return false;
		}
		return REQUEST_HEADERS.has(name) || name.startsWith(CUSTOM_HEADER_PREFIX);
	});
}

export function filterResponseHeaders(upstream: IncomingHttpHeaders): OutgoingHttpHeaders {
	return pickHeaders(upstream, (name) => RESPONSE_HEADERS.has(name) || name.startsWith(CUSTOM_HEADER_PREFIX));
}

export interface ForwardedInfo {
	readonly remoteAddress?: string;
	readonly protocol: string;
	readonly host?: string;
}

export function buildForwardedHeaders(incoming: IncomingHttpHeaders, info: ForwardedInfo): OutgoingHttpHeaders {
	const chain = [incoming['x-forwarded-for'], info.remoteAddress].flat().filter(Boolean);
	const headers: OutgoingHttpHeaders = { 'x-forwarded-proto': info.protocol };
	if (chain.length > 0) {
		headers['x-forwarded-for'] = chain.join(', ');
	}
	if (info.host) {
		headers['x-forwarded-host'] = info.host;
	}
	return headers;
}

function pickHeaders(source: IncomingHttpHeaders, accept: (name: string) => boolean): OutgoingHttpHeaders {
	const result: OutgoingHttpHeaders = {};
	for (const [rawName, value] of Object.entries(source)) {
		const name = rawName.toLowerCase();
		if (value !== undefined && !BLOCKED_HEADERS.has(name) && accept(name)) {
			result[name] = value;
		}
	}
	return result;
}
