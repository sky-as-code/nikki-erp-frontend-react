import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import {
	ATTR_ERROR_TYPE, ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_RESPONSE_STATUS_CODE, ATTR_SERVER_ADDRESS, ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';

import { telemetryTracer } from './provider';

import type { Context, Span } from '@opentelemetry/api';


/**
 * Opens the CLIENT span of one transmission attempt, as a child of `parent` (the operation's context, or
 * `ROOT_CONTEXT` for a root CLIENT span, FE-04). The name is the method alone and the URL is recorded
 * without its query string, so neither IDs nor search terms reach telemetry.
 */
export function startHttpClientSpan(method: string, url: string, parent: Context): Span {
	const target = new URL(url);
	return telemetryTracer().startSpan(method.toUpperCase(), {
		kind: SpanKind.CLIENT,
		attributes: {
			[ATTR_HTTP_REQUEST_METHOD]: method.toUpperCase(),
			[ATTR_URL_FULL]: `${target.origin}${target.pathname}`,
			[ATTR_SERVER_ADDRESS]: target.hostname,
		},
	}, parent);
}

/** Ends the span with the response status; 4xx and 5xx are errors for a CLIENT span (semantic conventions). */
export function endHttpClientSpan(span: Span, response: Response): void {
	try {
		span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
		if (response.status >= 400) {
			span.setAttribute(ATTR_ERROR_TYPE, String(response.status));
			span.setStatus({ code: SpanStatusCode.ERROR });
		}
		span.end();
	}
	catch {
		// Telemetry never fails the caller.
	}
}
