import { ROOT_CONTEXT, trace } from '@opentelemetry/api';
import { ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

import { endHttpClientSpan, startHttpClientSpan } from './httpClientSpan';
import { IDEMPOTENCY_HEADER, newIdempotencyId } from './idempotency';
import { CANCELLED_ATTRIBUTE, endSpanWithError } from './operation';
import { injectTraceHeaders, isPropagationTarget, isTelemetryExportUrl } from './propagation';

import type { TelemetryOperation } from './operation';
import type { Context, Span } from '@opentelemetry/api';


/**
 * State of one logical request, shared by every transmission attempt of it: the idempotency ID is minted
 * once, before the first attempt, and never per attempt (FE-ID-02).
 */
export type FetchCallTelemetry = {
	idempotencyId: string,
	operation?: TelemetryOperation,
	/** With no operation, the first attempt's span: later attempts join its trace (FE-06). */
	firstAttemptContext?: Context,
};

export function newFetchCallTelemetry(operation?: TelemetryOperation, idempotencyId?: string): FetchCallTelemetry {
	return { idempotencyId: idempotencyId ?? newIdempotencyId(), operation };
}

/**
 * Opens the CLIENT span of one attempt of `call` and, for an allowlisted target only, writes `traceparent`
 * and `X-Idempotency-ID` onto `headers`. For a call sent with a bare `fetch` as well as by `RequestMaker`.
 * Returns `undefined` (and stamps nothing) for the exporter's own URL or when telemetry fails.
 */
export function startFetchAttempt(
	method: string, url: string, headers: Headers, call: FetchCallTelemetry,
): Span | undefined {
	try {
		const target = absoluteUrl(url);
		if (!target || isTelemetryExportUrl(target)) return undefined;
		const parent = call.operation?.context ?? call.firstAttemptContext ?? ROOT_CONTEXT;
		const span = startHttpClientSpan(method, target, parent);
		if (!call.operation && !call.firstAttemptContext) {
			call.firstAttemptContext = trace.setSpan(ROOT_CONTEXT, span);
		}
		if (isPropagationTarget(target)) {
			injectTraceHeaders(headers, trace.setSpan(call.operation?.context ?? ROOT_CONTEXT, span));
			headers.set(IDEMPOTENCY_HEADER, call.idempotencyId);
		}
		return span;
	}
	catch (error) {
		console.warn('Request telemetry skipped', error);
		return undefined;
	}
}

/**
 * Ends an attempt's span with the response status. Call it once, when the response is fully consumed;
 * `cancelled` when the caller stopped reading it early (marked, not an error).
 */
export function finishFetchAttempt(span: Span | undefined, response: Pick<Response, 'status'>, cancelled = false): void {
	if (!span) return;
	if (cancelled) span.setAttribute(CANCELLED_ATTRIBUTE, true);
	endHttpClientSpan(span, response as Response);
}

/** Ends an attempt's span as failed, or as cancelled for an abort; records the status when one arrived. */
export function failFetchAttempt(span: Span | undefined, error: unknown, response?: Pick<Response, 'status'>): void {
	if (!span) return;
	if (response) span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
	endSpanWithError(span, error);
}

function absoluteUrl(url: string): string | undefined {
	try {
		const base = (globalThis as { location?: { href?: string } }).location?.href;
		return new URL(url, base).href;
	}
	catch {
		return undefined;
	}
}
