import { ACTIVE_ORG_STORAGE_KEY } from './types';


/**
 * The organization the user last worked in, or `null` when nothing is stored.
 *
 * Stored as a plain string: unlike `LocalSettings` this is a single opaque id, so the
 * base64-of-JSON treatment its neighbour gets would obscure it for no gain.
 *
 * The value is **not** trusted on the way out. An id can outlive the user's access to it — they
 * leave the org, or it is deleted — so every caller must check it against the org list from
 * `me/context` before using it to scope a request. {@link resolveActiveOrgId} is that check.
 */
export function loadActiveOrgId(): string | null {
	if (typeof localStorage === 'undefined') {
		return null;
	}
	return localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
}

export function saveActiveOrgId(orgId: string): void {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId);
}

export function clearActiveOrgId(): void {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
}
