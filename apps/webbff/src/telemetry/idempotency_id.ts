import { AsyncLocalStorage } from 'node:async_hooks';

import { v7 as uuidV7 } from 'uuid';


export const IDEMPOTENCY_ID_HEADER = 'x-idempotency-id';
export const IDEMPOTENCY_ID_RESPONSE_HEADER = 'X-Idempotency-ID';

// Canonical 36-char form, version 7, RFC 9562 variant. Applied to the lowercased value only.
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Its own store, not the OpenTelemetry context: the id must work whether telemetry is registered or not.
const store = new AsyncLocalStorage<string>();

/** The canonical lowercase id, or undefined for anything else (v4, nil, URN, braces, lists, blanks). */
export function parseIdempotencyId(raw: string): string | undefined {
	const lowered = raw.toLowerCase();
	return UUID_V7.test(lowered) ? lowered : undefined;
}

/** Throws when the generator fails: there is no fallback id of another kind (FMT-05). */
export function newIdempotencyId(): string {
	return uuidV7();
}

/** The id of the operation being served; never generates one. */
export function currentIdempotencyId(): string | undefined {
	return store.getStore();
}

export function runWithIdempotencyId<T>(id: string, fn: () => T): T {
	return store.run(id, fn);
}
