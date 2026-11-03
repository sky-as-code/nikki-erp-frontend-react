import {
	INVALID_SPAN_CONTEXT, propagation, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace,
} from '@opentelemetry/api';

import { telemetryTracer } from './provider';

import type { Context, Span } from '@opentelemetry/api';


/**
 * A handle on one user operation (screen load, form save, confirm). Pass it to `RequestMaker` calls as
 * `{ operation }`: the handle, not an ambient context, is what keeps overlapping operations apart, because
 * no browser context manager survives native `async/await` (AC-09).
 */
export type TelemetryOperation = {
	readonly name: string,
	readonly span: Span,
	readonly context: Context,
};

export type TraceOperationOptions = {
	/** Technical, non-sensitive entries; only keys in `OTEL_BAGGAGE_ALLOWLIST` ever leave the browser. */
	baggage?: Record<string, string>,
};

export const CANCELLED_ATTRIBUTE = 'coremart.cancelled';

/** Fixed names of the shared UI operations; never put an ID in an operation name. */
export const UI_OPERATIONS = Object.freeze({
	SCREEN_LOAD: 'ui.screen.load',
	FORM_SAVE: 'ui.form.save',
	ACTION_INVOKE: 'ui.action.invoke',
	SESSION_KEEP_ALIVE: 'ui.session.keep_alive',
});

/**
 * Runs `fn` inside a new root INTERNAL span named `name` (e.g. `inventory.product.update`, never with IDs),
 * ended once `fn` settles: ok, failed (exception recorded, status error) or cancelled (an `AbortError`,
 * marked but not an error). The result or error of `fn` passes through untouched.
 */
export async function traceOperation<T>(
	name: string, fn: (operation: TelemetryOperation) => Promise<T>, options?: TraceOperationOptions,
): Promise<T> {
	const operation = startOperation(name, options);
	try {
		const result = await fn(operation);
		endSpanOk(operation.span);
		return result;
	}
	catch (error) {
		endSpanWithError(operation.span, error);
		throw error;
	}
}

export function isAbortError(error: unknown): boolean {
	return error instanceof Error && error.name === 'AbortError';
}

/** Ends a span with an error status, or as cancelled for an abort. Never throws. */
export function endSpanWithError(span: Span, error: unknown): void {
	recordSpanError(span, error);
	endSpanOk(span);
}

/**
 * Marks `span` failed (or cancelled, for an abort) without ending it. For an operation whose failure comes
 * back as a value, e.g. a command-bus response's `error`, rather than as a thrown error. Never throws.
 */
export function recordSpanError(span: Span, error: unknown): void {
	try {
		if (isAbortError(error)) {
			span.setAttribute(CANCELLED_ATTRIBUTE, true);
		}
		else {
			span.recordException(error instanceof Error ? error : String(error));
			span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : undefined });
		}
	}
	catch {
		// Telemetry never fails the caller.
	}
}

function endSpanOk(span: Span): void {
	try {
		span.end();
	}
	catch {
		// Telemetry never fails the caller.
	}
}

function startOperation(name: string, options?: TraceOperationOptions): TelemetryOperation {
	try {
		const span = telemetryTracer().startSpan(name, { kind: SpanKind.INTERNAL, root: true }, ROOT_CONTEXT);
		let ctx = trace.setSpan(ROOT_CONTEXT, span);
		if (options?.baggage) {
			ctx = propagation.setBaggage(ctx, propagation.createBaggage(toBaggageEntries(options.baggage)));
		}
		return { name, span, context: ctx };
	}
	catch {
		const span = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
		return { name, span, context: trace.setSpan(ROOT_CONTEXT, span) };
	}
}

function toBaggageEntries(values: Record<string, string>): Record<string, { value: string }> {
	return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }]));
}
