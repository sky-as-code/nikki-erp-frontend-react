import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveActiveOrgId } from './activeOrg';
import { loadActiveOrgId, saveActiveOrgId } from './orgStorage';
import { ACTIVE_ORG_STORAGE_KEY, UserContextOrg } from './types';


// These tests run in node, as the rest of the shell's do: the resolver reads and writes
// `localStorage` directly.
const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
	getItem: (key: string) => storage.get(key) ?? null,
	setItem: (key: string, value: string) => { storage.set(key, value); },
	removeItem: (key: string) => { storage.delete(key); },
	clear: () => { storage.clear(); },
});


function org(id: string, slug = id): UserContextOrg {
	return { id, slug, display_name: { en: slug } as any };
}

const acme = org('01ORG000000000000000000ACME');
const globex = org('01ORG00000000000000000GLOBEX');


describe('resolveActiveOrgId', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('returns null and stores nothing when the user has no org', () => {
		expect(resolveActiveOrgId([])).toBeNull();
		expect(loadActiveOrgId()).toBeNull();
	});

	it('picks and stores the first org when nothing is stored', () => {
		expect(resolveActiveOrgId([acme, globex])).toBe(acme.id);
		expect(loadActiveOrgId()).toBe(acme.id);
	});

	it('keeps a stored org that is still in the list, first or not', () => {
		saveActiveOrgId(globex.id);
		expect(resolveActiveOrgId([acme, globex])).toBe(globex.id);
		expect(loadActiveOrgId()).toBe(globex.id);
	});

	// The case that makes the membership test load-bearing: an id outlives the user's access to
	// it, and trusting it would scope every request to an org the backend refuses.
	it('discards a stored org the user no longer belongs to, then falls back to the first', () => {
		saveActiveOrgId('01ORG0000000000000000STALE0');
		expect(resolveActiveOrgId([acme, globex])).toBe(acme.id);
		expect(loadActiveOrgId()).toBe(acme.id);
	});

	it('clears a stale stored org even when there is no org to fall back to', () => {
		saveActiveOrgId('01ORG0000000000000000STALE0');
		expect(resolveActiveOrgId([])).toBeNull();
		// The list is empty, so the stale id is left for the next resolve to clear rather than
		// removed here: an empty list is also what a pending fetch looks like, and discarding the
		// user's org on every boot would lose their choice.
		expect(loadActiveOrgId()).toBe('01ORG0000000000000000STALE0');
	});

	it('stores under the shared key so a reload reads the same value back', () => {
		resolveActiveOrgId([acme]);
		expect(localStorage.getItem(ACTIVE_ORG_STORAGE_KEY)).toBe(acme.id);
	});
});
