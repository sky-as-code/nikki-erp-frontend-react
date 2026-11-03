import { SpanStatusCode, trace } from '@opentelemetry/api';

import { buildErrors, sendErrors } from './errors';

import type { Logger } from '../logging/logger';
import type { ErrorRequestHandler } from 'express';


export const ERR_INTERNAL = 'common:err_internal_server';

/**
 * Last handler of the app. Express calls it in the request's async context, so the log record and the span are
 * the request's own, and the answer keeps the `X-Trace-ID`/`X-Idempotency-ID` headers already set.
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
	return (err: unknown, req, res, next) => {
		const error = err instanceof Error ? err : new Error(String(err));
		const span = trace.getActiveSpan();
		span?.recordException(error);
		span?.setStatus({ code: SpanStatusCode.ERROR, message: error.name });
		logger.error(`Unhandled error on ${req.method} ${req.path}`, error);
		if (res.headersSent) {
			// Express's own handler closes the connection of a half-sent answer.
			next(err);
			return;
		}
		sendErrors(res, 500, buildErrors('business', ERR_INTERNAL, 'An unexpected error occurred'));
	};
}
