import { failFetchAttempt, finishFetchAttempt, newFetchCallTelemetry, startFetchAttempt } from '../telemetry/fetchAttempt';

import type { FetchCallTelemetry } from '../telemetry/fetchAttempt';
import type { TelemetryOperation } from '../telemetry/operation';
import type { Span } from '@opentelemetry/api';
import type { KyRequest } from 'ky';


/** The ky option under which `RequestMaker._send` hands its logical-call state to the hooks. */
export const REQUEST_TELEMETRY_OPTION = 'requestTelemetry' as const;

/** State of one logical call, shared by every transmission attempt of it (FE-ID-02). */
export type RequestTelemetryState = FetchCallTelemetry;

/** The extra ky option `RequestMaker._send` sets; ky passes unknown options through to the hooks. */
export type WithRequestTelemetry = {
	[REQUEST_TELEMETRY_OPTION]?: RequestTelemetryState,
};

export function newRequestTelemetryState(
	operation?: TelemetryOperation, idempotencyId?: string,
): RequestTelemetryState {
	return newFetchCallTelemetry(operation, idempotencyId);
}

/**
 * State for a raw `ky()` call, which bypasses `_send`: keyed on ky's per-call options object, which
 * every attempt of that call shares, so its retries keep one ID too.
 */
const rawCallStates = new WeakMap<object, RequestTelemetryState>();
/** The open span of each attempt, from the hook that stamps the request to the fetch that sends it. */
const pendingSpans = new WeakMap<Request, Span>();

/**
 * `beforeRequest` hook, run per attempt and registered last, so no later hook can skip the send: opens the
 * attempt's CLIENT span and, for an allowlisted target only, sets `traceparent` and `X-Idempotency-ID`.
 */
export function stampRequestTelemetry(request: KyRequest, options: object): void {
	const span = startFetchAttempt(request.method, request.url, request.headers, callState(options));
	if (span) pendingSpans.set(request, span);
}

/** The ky instance's `fetch`: sends as before, then ends the attempt's span exactly once. */
export async function tracedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const span = input instanceof Request ? pendingSpans.get(input) : undefined;
	if (span) pendingSpans.delete(input as Request);
	try {
		const response = await globalThis.fetch(input, init);
		finishFetchAttempt(span, response);
		return response;
	}
	catch (error) {
		failFetchAttempt(span, error);
		throw error;
	}
}

function callState(options: object): RequestTelemetryState {
	const given = (options as WithRequestTelemetry)[REQUEST_TELEMETRY_OPTION];
	if (given) return given;
	let state = rawCallStates.get(options);
	if (!state) {
		state = newRequestTelemetryState();
		rawCallStates.set(options, state);
	}
	return state;
}
