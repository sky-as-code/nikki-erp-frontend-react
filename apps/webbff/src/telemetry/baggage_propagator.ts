import { propagation } from '@opentelemetry/api';
import { W3CBaggagePropagator } from '@opentelemetry/core';

import type {
	Baggage, BaggageEntry, Context, TextMapGetter, TextMapPropagator, TextMapSetter,
} from '@opentelemetry/api';


/** Core Mart policy, not a W3C limit. */
export const MAX_BAGGAGE_ENTRIES = 16;
export const MAX_BAGGAGE_BYTES = 2048;

/**
 * W3C baggage restricted to an allowlist of keys at both extract and inject. Entries are kept in header order
 * until either limit is reached; that entry and every later one are dropped, so the result is deterministic.
 */
export function createAllowlistBaggagePropagator(allowlist: readonly string[]): TextMapPropagator {
	const inner = new W3CBaggagePropagator();
	const allowed = new Set(allowlist);
	return {
		inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
			inner.inject(withFilteredBaggage(context, allowed), carrier, setter);
		},
		extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
			return withFilteredBaggage(inner.extract(context, carrier, getter), allowed);
		},
		fields: () => inner.fields(),
	};
}

function withFilteredBaggage(context: Context, allowed: ReadonlySet<string>): Context {
	const baggage = propagation.getBaggage(context);
	if (!baggage) {
		return context;
	}
	const kept = filterBaggage(baggage, allowed);
	return kept.length === 0
		? propagation.deleteBaggage(context)
		: propagation.setBaggage(context, propagation.createBaggage(Object.fromEntries(kept)));
}

export function filterBaggage(baggage: Baggage, allowed: ReadonlySet<string>): Array<[string, BaggageEntry]> {
	const kept: Array<[string, BaggageEntry]> = [];
	let bytes = 0;
	for (const [key, entry] of baggage.getAllEntries()) {
		if (!allowed.has(key)) {
			continue;
		}
		const size = encodedSize(key, entry) + (kept.length > 0 ? 1 : 0);
		if (kept.length >= MAX_BAGGAGE_ENTRIES || bytes + size > MAX_BAGGAGE_BYTES) {
			break;
		}
		kept.push([key, entry]);
		bytes += size;
	}
	return kept;
}

function encodedSize(key: string, entry: BaggageEntry): number {
	const metadata = entry.metadata ? `;${entry.metadata.toString()}` : '';
	return Buffer.byteLength(`${encodeURIComponent(key)}=${encodeURIComponent(entry.value)}${metadata}`);
}
