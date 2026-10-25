import fs from 'node:fs';
import http, { type IncomingHttpHeaders, type IncomingMessage, type OutgoingHttpHeaders } from 'node:http';
import https from 'node:https';

import { sendUpstreamUnavailable, UpstreamUnavailableError } from './errors';
import { ACCESS_TOKEN_HEADER, buildForwardedHeaders, filterRequestHeaders, filterResponseHeaders } from './headers';

import type { UpstreamConfig } from '../config/types';
import type { Logger } from '../logging/logger';
import type { TLSSocket } from 'node:tls';




export interface ForwardOptions {
	/** Upstream path including the query string, e.g. `/v1/iam/iam_user?page=0`. */
	readonly upstreamPath: string;
	readonly accessToken?: string;
}

export interface RequestJsonOptions {
	readonly headers?: OutgoingHttpHeaders;
	/** Serialized as JSON when defined. */
	readonly body?: unknown;
	readonly accessToken?: string;
	/** Browser request whose allowlisted headers, Host and forwarding info are carried over. */
	readonly incomingReq?: IncomingMessage;
}

export interface UpstreamJsonResponse<T> {
	readonly status: number;
	readonly headers: IncomingHttpHeaders;
	/** Parsed JSON; the raw text when the body is not JSON; undefined when empty. */
	readonly body: T;
}

export interface UpstreamClient {
	/** Streams `req` to the upstream and the upstream response back to `res`, without buffering. */
	forward(req: IncomingMessage, res: http.ServerResponse, options: ForwardOptions): void;
	/** Buffered JSON call for accumulation endpoints. Rejects with `UpstreamUnavailableError` on network errors. */
	requestJson<T = unknown>(
		method: string, path: string, options?: RequestJsonOptions,
	): Promise<UpstreamJsonResponse<T>>;
}

export function resolveUpstreamHost(config: UpstreamConfig, incomingHost: string | undefined): string {
	if (config.forwardHost && incomingHost) {
		return incomingHost;
	}
	return config.baseUrl.host;
}

export function joinUpstreamPath(baseUrl: URL, upstreamPath: string): string {
	return baseUrl.pathname.replace(/\/+$/, '') + upstreamPath;
}

export function createUpstreamClient(config: UpstreamConfig, logger: Logger): UpstreamClient {
	const isHttps = config.baseUrl.protocol === 'https:';
	const agent = isHttps ? createHttpsAgent(config, logger) : new http.Agent({ keepAlive: true });
	const transport = { config, agent, isHttps, logger };
	return {
		forward: (req, res, options) => forward(transport, req, res, options),
		requestJson: (method, path, options) => requestJson(transport, method, path, options ?? {}),
	};
}

type Transport = {
	readonly config: UpstreamConfig;
	readonly agent: http.Agent;
	readonly isHttps: boolean;
	readonly logger: Logger;
};

function createHttpsAgent(config: UpstreamConfig, logger: Logger): https.Agent {
	const { tls } = config;
	if (tls.insecure) {
		logger.warn('WARNING: NIKKI_BFF_UPSTREAM_TLS_INSECURE=true, upstream TLS certificates are NOT verified');
	}
	return new https.Agent({
		keepAlive: true,
		ca: tls.caFiles.length > 0 ? tls.caFiles.map((file) => fs.readFileSync(file, 'utf8')) : undefined,
		cert: tls.clientCertFile ? fs.readFileSync(tls.clientCertFile, 'utf8') : undefined,
		key: tls.clientKeyFile ? fs.readFileSync(tls.clientKeyFile, 'utf8') : undefined,
		rejectUnauthorized: !tls.insecure,
		servername: config.baseUrl.hostname,
	});
}

function buildHeaders(
	transport: Transport, incoming: IncomingMessage | undefined, keepBodyHeaders: boolean, accessToken?: string,
): OutgoingHttpHeaders {
	const headers: OutgoingHttpHeaders = {
		...(incoming ? filterRequestHeaders(incoming.headers, { keepBodyHeaders }) : {}),
		...(incoming ? buildForwardedHeaders(incoming.headers, describeIncoming(incoming)) : {}),
		host: resolveUpstreamHost(transport.config, incoming?.headers.host),
	};
	if (accessToken) {
		headers[ACCESS_TOKEN_HEADER] = accessToken;
	}
	return headers;
}

function describeIncoming(incoming: IncomingMessage) {
	return {
		remoteAddress: incoming.socket.remoteAddress,
		protocol: (incoming.socket as TLSSocket).encrypted ? 'https' : 'http',
		host: incoming.headers.host,
	};
}

function openRequest(
	transport: Transport, method: string, path: string, headers: OutgoingHttpHeaders,
): http.ClientRequest {
	const { baseUrl } = transport.config;
	const options: http.RequestOptions = {
		protocol: baseUrl.protocol,
		hostname: baseUrl.hostname,
		port: baseUrl.port || undefined,
		method,
		path: joinUpstreamPath(baseUrl, path),
		headers,
		agent: transport.agent,
	};
	const request = transport.isHttps ? https.request(options) : http.request(options);
	const timer = setTimeout(() => {
		request.destroy(new UpstreamUnavailableError(`Upstream did not respond within ${transport.config.timeoutMs}ms`));
	}, transport.config.timeoutMs);
	request.once('response', () => clearTimeout(timer));
	request.once('close', () => clearTimeout(timer));
	return request;
}

function forward(transport: Transport, req: IncomingMessage, res: http.ServerResponse, options: ForwardOptions): void {
	const headers = buildHeaders(transport, req, true, options.accessToken);
	const upstreamReq = openRequest(transport, req.method ?? 'GET', options.upstreamPath, headers);
	upstreamReq.on('response', (upstreamRes) => {
		res.writeHead(upstreamRes.statusCode ?? 502, filterResponseHeaders(upstreamRes.headers));
		res.flushHeaders();
		upstreamRes.on('error', () => res.destroy());
		upstreamRes.pipe(res);
	});
	upstreamReq.on('error', (err) => {
		if (res.headersSent || res.destroyed) {
			res.destroy();
			return;
		}
		transport.logger.warn(`Upstream ${req.method} ${options.upstreamPath} failed: ${err.message}`);
		sendUpstreamUnavailable(res);
	});
	res.on('close', () => {
		if (!res.writableFinished) {
			upstreamReq.destroy();
		}
	});
	req.pipe(upstreamReq);
}

function requestJson<T>(
	transport: Transport, method: string, path: string, options: RequestJsonOptions,
): Promise<UpstreamJsonResponse<T>> {
	const payload = options.body === undefined ? undefined : JSON.stringify(options.body);
	const headers: OutgoingHttpHeaders = {
		...buildHeaders(transport, options.incomingReq, false, options.accessToken),
		accept: 'application/json',
		...options.headers,
	};
	if (payload !== undefined) {
		headers['content-type'] = 'application/json';
		headers['content-length'] = Buffer.byteLength(payload);
	}
	return new Promise((resolve, reject) => {
		const request = openRequest(transport, method, path, headers);
		request.on('response', (response) => collectJson<T>(response).then(resolve, reject));
		request.on('error', (err) => reject(asUnavailable(err)));
		request.end(payload);
	});
}

async function collectJson<T>(response: IncomingMessage): Promise<UpstreamJsonResponse<T>> {
	const chunks: Buffer[] = [];
	try {
		for await (const chunk of response) {
			chunks.push(chunk as Buffer);
		}
	}
	catch (err) {
		throw asUnavailable(err as Error);
	}
	const text = Buffer.concat(chunks).toString('utf8');
	return { status: response.statusCode ?? 502, headers: response.headers, body: parseBody(text) as T };
}

function parseBody(text: string): unknown {
	if (text === '') {
		return undefined;
	}
	try {
		return JSON.parse(text);
	}
	catch {
		return text;
	}
}

function asUnavailable(err: Error): UpstreamUnavailableError {
	return err instanceof UpstreamUnavailableError ? err : new UpstreamUnavailableError(err.message, { cause: err });
}
