import { propagation } from '@opentelemetry/api';
import { W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

import { telemetryConfig } from './provider';

import type { Baggage, Context, TextMapSetter } from '@opentelemetry/api';


// Core Mart policy (OTEL §3.3): at most 16 entries and 2048 encoded bytes leave the browser.
const MAX_BAGGAGE_ENTRIES = 16;
const MAX_BAGGAGE_BYTES = 2048;

const traceContextPropagator = new W3CTraceContextPropagator();
const baggagePropagator = new W3CBaggagePropagator();

const headersSetter: TextMapSetter<Headers> = {
	set: (carrier, key, value) => carrier.set(key, value),
};

/**
 * Whether trace context and the idempotency ID may be sent to `url`. Only allowlisted targets qualify
 * (default: the page's own `/api`), so nothing leaks to a third party (AC-21).
 */
export function isPropagationTarget(url: string): boolean {
	const target = parseUrl(url);
	if (!target || isTelemetryExportUrl(url)) return false;
	return telemetryConfig().propagationOrigins.some((entry) => isSameOrUnder(target, parseUrl(entry)));
}

/** The exporter's own endpoint, which is never instrumented, so exporting creates no spans (AC-22). */
export function isTelemetryExportUrl(url: string): boolean {
	const exporterUrl = telemetryConfig().exporterUrl;
	const target = parseUrl(url);
	return Boolean(exporterUrl && target && isSameOrUnder(target, parseUrl(exporterUrl)));
}

/** Writes `traceparent`/`tracestate`, plus the allowlisted part of the context's baggage, onto `headers`. */
export function injectTraceHeaders(headers: Headers, ctx: Context): void {
	traceContextPropagator.inject(ctx, headers, headersSetter);
	const baggage = allowedBaggage(propagation.getBaggage(ctx));
	if (baggage) {
		baggagePropagator.inject(propagation.setBaggage(ctx, baggage), headers, headersSetter);
	}
}

/** Keeps allowlisted keys only, within the entry and byte limits; dropping is deterministic (key order). */
export function allowedBaggage(baggage: Baggage | undefined): Baggage | undefined {
	const allowlist = telemetryConfig().baggageAllowlist;
	if (!baggage || allowlist.length === 0) return undefined;
	const kept = baggage.getAllEntries()
		.filter(([key]) => allowlist.includes(key))
		.sort(([left], [right]) => left.localeCompare(right));
	let result = propagation.createBaggage();
	let bytes = 0;
	for (const [key, entry] of kept.slice(0, MAX_BAGGAGE_ENTRIES)) {
		const size = encodeURIComponent(key).length + encodeURIComponent(entry.value).length + 2;
		if (bytes + size > MAX_BAGGAGE_BYTES) continue;
		bytes += size;
		result = result.setEntry(key, { value: entry.value });
	}
	return result.getAllEntries().length > 0 ? result : undefined;
}

function parseUrl(value: string | undefined): URL | null {
	if (!value) return null;
	try {
		return new URL(value, pageOrigin());
	}
	catch {
		return null;
	}
}

function pageOrigin(): string | undefined {
	const origin = (globalThis as { location?: { origin?: string } }).location?.origin;
	return origin && origin !== 'null' ? origin : undefined;
}

function isSameOrUnder(target: URL, entry: URL | null): boolean {
	if (!entry || target.origin !== entry.origin) return false;
	const prefix = entry.pathname.replace(/\/+$/, '');
	return prefix === '' || target.pathname === prefix || target.pathname.startsWith(`${prefix}/`);
}
