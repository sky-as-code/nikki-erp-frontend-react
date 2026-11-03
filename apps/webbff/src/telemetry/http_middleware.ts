import {
	context, isSpanContextValid, propagation, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace,
} from '@opentelemetry/api';

import {
	IDEMPOTENCY_ID_HEADER, IDEMPOTENCY_ID_RESPONSE_HEADER, newIdempotencyId, parseIdempotencyId, runWithIdempotencyId,
} from './idempotency_id';
import { getTracer } from './provider';
import { sendErrors } from '../common/http/errors';

import type { Logger } from '../common/logging/logger';
import type { Span } from '@opentelemetry/api';
import type { Request, RequestHandler, Response } from 'express';


export const TRACE_ID_RESPONSE_HEADER = 'X-Trace-ID';
export const ERR_INVALID_IDEMPOTENCY_ID = 'common:err_invalid_idempotency_id';
export const IDEMPOTENCY_ID_SPAN_ATTRIBUTE = 'coremart.idempotency_id';

/**
 * First middleware of the app: one SERVER span per request, child of a valid inbound `traceparent` (else a new
 * root), named `METHOD route` without the query string. Sets `X-Trace-ID` before anything can answer, and ends the
 * span exactly once, on finish or close. Only 5xx marks it as an error.
 */
export function createTracingMiddleware(): RequestHandler {
	return (req, res, next) => {
		const parent = propagation.extract(ROOT_CONTEXT, req.headers);
		const span = getTracer().startSpan(req.method, {
			kind: SpanKind.SERVER,
			attributes: {
				'http.request.method': req.method,
				'url.path': req.path,
				'url.scheme': req.protocol,
			},
		}, parent);
		const spanContext = span.spanContext();
		if (isSpanContextValid(spanContext)) {
			res.setHeader(TRACE_ID_RESPONSE_HEADER, spanContext.traceId);
		}
		let ended = false;
		const end = () => {
			if (!ended) {
				ended = true;
				finishServerSpan(span, req, res);
			}
		};
		res.once('finish', end);
		res.once('close', end);
		context.with(trace.setSpan(parent, span), next);
	};
}

function finishServerSpan(span: Span, req: Request, res: Response): void {
	const route = resolveRoute(req);
	span.updateName(`${req.method} ${route}`);
	span.setAttribute('http.route', route);
	if (res.headersSent) {
		span.setAttribute('http.response.status_code', res.statusCode);
		if (res.statusCode >= 500) {
			span.setStatus({ code: SpanStatusCode.ERROR });
		}
	}
	// A browser disconnect before the answer is a cancellation, not a server error: the status stays unset.
	span.end();
}

/** The matched route template; paths served by `use()` mounts (proxy, hosting) get a fixed low-cardinality name. */
export function resolveRoute(req: Request): string {
	const routePath: unknown = req.route?.path;
	if (typeof routePath === 'string') {
		return `${req.baseUrl}${routePath}` || '/';
	}
	return req.originalUrl.startsWith('/api/') ? '/api/*' : '/*';
}

/**
 * `X-Idempotency-ID`: a valid UUIDv7 is kept (lowercased); none at all gets one generated once; anything else
 * (blank, other version, list, repeated header) is a 400 that runs no handler and never echoes the value.
 */
export function createIdempotencyMiddleware(logger: Logger): RequestHandler {
	return (req, res, next) => {
		const values = req.headersDistinct[IDEMPOTENCY_ID_HEADER];
		const id = values === undefined ? newIdempotencyId() : readSingleId(values);
		if (!id) {
			const reason = values && values.length > 1 ? 'multiple_values' : 'invalid_format';
			logger.warn('Rejected an invalid X-Idempotency-ID header', { reason });
			sendInvalidIdempotencyId(res);
			return;
		}
		res.setHeader(IDEMPOTENCY_ID_RESPONSE_HEADER, id);
		trace.getActiveSpan()?.setAttribute(IDEMPOTENCY_ID_SPAN_ATTRIBUTE, id);
		runWithIdempotencyId(id, next);
	};
}

function readSingleId(values: readonly string[]): string | undefined {
	return values.length === 1 ? parseIdempotencyId(values[0]) : undefined;
}

function sendInvalidIdempotencyId(res: Response): void {
	sendErrors(res, 400, [{
		type: 'validation',
		key: ERR_INVALID_IDEMPOTENCY_ID,
		field: 'X-Idempotency-ID',
		message: 'X-Idempotency-ID must be one canonical UUIDv7',
	}]);
}
