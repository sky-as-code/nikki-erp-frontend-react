import { context, propagation, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

import { stripTelemetryHeaders } from './headers';
import { currentIdempotencyId, IDEMPOTENCY_ID_HEADER, parseIdempotencyId } from '../../telemetry/idempotency_id';
import { getTracer } from '../../telemetry/provider';

import type { UpstreamConfig } from '../config/types';
import type { Logger } from '../logging/logger';
import type { Span } from '@opentelemetry/api';
import type { ClientRequest, IncomingMessage, OutgoingHttpHeaders } from 'node:http';


export interface UpstreamCall {
	readonly method: string;
	/** Upstream path as sent, query string included; only its path part reaches the span. */
	readonly path: string;
	readonly headers: OutgoingHttpHeaders;
}

/**
 * Opens the CLIENT span of one upstream call, child of the active context, and rewrites `call.headers`: inherited
 * telemetry headers are always removed; `traceparent`/`tracestate`/`baggage` and `X-Idempotency-ID` are injected
 * only when the destination host is allowlisted (AC-21, PROP-05). Returns the hook that ends the span with the call.
 */
export function startUpstreamSpan(
	config: UpstreamConfig, logger: Logger, call: UpstreamCall,
): (request: ClientRequest) => void {
	const { baseUrl } = config;
	const span = getTracer().startSpan(call.method, {
		kind: SpanKind.CLIENT,
		attributes: {
			'http.request.method': call.method,
			'server.address': baseUrl.hostname,
			'server.port': Number(baseUrl.port) || (baseUrl.protocol === 'https:' ? 443 : 80),
			'url.path': call.path.split('?', 1)[0],
		},
	});
	stripTelemetryHeaders(call.headers);
	const sentId = isPropagationHost(config) ? injectContext(span, call.headers) : undefined;
	return (request) => trackSpan(span, request, (response) => checkEchoedId(logger, call, sentId, response));
}

export function isPropagationHost(config: UpstreamConfig): boolean {
	const allowed = config.propagationHosts ?? [config.baseUrl.hostname.toLowerCase()];
	return allowed.includes(config.baseUrl.hostname.toLowerCase());
}

function injectContext(span: Span, headers: OutgoingHttpHeaders): string | undefined {
	propagation.inject(trace.setSpan(context.active(), span), headers);
	const id = currentIdempotencyId();
	if (id) {
		headers[IDEMPOTENCY_ID_HEADER] = id;
	}
	return id;
}

/** Ends the span exactly once: when the response body is done or dropped, or when the call fails without one. */
function trackSpan(span: Span, request: ClientRequest, onResponse: (response: IncomingMessage) => void): void {
	let ended = false;
	let responded = false;
	const end = () => {
		if (!ended) {
			ended = true;
			span.end();
		}
	};
	request.once('response', (response) => {
		responded = true;
		recordStatus(span, response.statusCode ?? 0);
		onResponse(response);
		response.once('close', end);
	});
	request.once('error', (err) => {
		// A caller's abort (browser gone, sibling upload failed) is a cancellation, not a failure.
		if (err.name !== 'AbortError') {
			span.recordException(err);
			span.setStatus({ code: SpanStatusCode.ERROR, message: err.name });
		}
		end();
	});
	request.once('close', () => !responded && end());
}

/** HTTP CLIENT convention: 4xx and 5xx are errors. */
function recordStatus(span: Span, status: number): void {
	span.setAttribute('http.response.status_code', status);
	if (status >= 400) {
		span.setStatus({ code: SpanStatusCode.ERROR });
	}
}

/** PROP-06: a different id from downstream is only diagnosed; the effective id stays the caller's. */
function checkEchoedId(
	logger: Logger, call: UpstreamCall, sentId: string | undefined, response: IncomingMessage,
): void {
	const echoed = response.headers[IDEMPOTENCY_ID_HEADER];
	if (!sentId || echoed === undefined) {
		return;
	}
	const parsed = typeof echoed === 'string' ? parseIdempotencyId(echoed) : undefined;
	if (parsed !== sentId) {
		logger.warn('Upstream answered with a different X-Idempotency-ID', {
			upstream_path: call.path.split('?', 1)[0],
			upstream_idempotency_id: parsed ?? 'invalid',
		});
	}
}
