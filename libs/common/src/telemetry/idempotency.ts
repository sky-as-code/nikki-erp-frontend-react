import { v7 as uuidV7 } from 'uuid';


export const IDEMPOTENCY_HEADER = 'X-Idempotency-ID';

/**
 * A new ID for one logical request: a canonical lowercase UUIDv7. It is random per call, never derived
 * from the trace, the payload or any session state, so two identical requests get two IDs (FE-ID-03).
 */
export function newIdempotencyId(): string {
	return uuidV7();
}
