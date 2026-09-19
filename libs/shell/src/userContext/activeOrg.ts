import { useModuleSelector } from '@nikkierp/ui/appState/store';
import React from 'react';

import { selectMyOrgs } from './orgSelectors';
import { clearActiveOrgId, loadActiveOrgId, saveActiveOrgId } from './orgStorage';
import { UserContextOrg } from './types';


/**
 * Picks the organization to work in, from `localStorage` rather than the URL.
 *
 * Resolution order:
 *
 * 1. A stored id that still appears in the user's org list wins.
 * 2. A stored id that does **not** is discarded — the user may have been removed from that org,
 *    or it may be gone. Keeping it would scope every request to an org the backend refuses.
 * 3. With nothing usable stored, the first org in the list is chosen and stored.
 *
 * Returns `null` while the org list is still in flight, and when the user has no org at all —
 * two states the caller has to tell apart by other means (`useGetUserContext().isPending`),
 * since neither yields an id.
 */
export function resolveActiveOrgId(orgs: UserContextOrg[]): string | null {
	if (orgs.length === 0) {
		return null;
	}

	const stored = loadActiveOrgId();
	if (stored) {
		if (orgs.some(org => org.id === stored)) {
			return stored;
		}
		clearActiveOrgId();
	}

	const first = orgs[0]!.id;
	saveActiveOrgId(first);
	return first;
}

/**
 * The active organization's id, resolved and persisted.
 *
 * Writing during the resolve is deliberate: the choice has to survive the next reload, and the
 * org switch (which hard-reloads) depends on this being the single place the id is read back
 * from.
 */
export function useActiveOrgId(): string | null {
	const orgs = useModuleSelector(selectMyOrgs);
	return React.useMemo(() => resolveActiveOrgId(orgs), [orgs]);
}

/** The active organization, or `null` before the org list arrives. */
export function useActiveOrg(): UserContextOrg | null {
	const orgs = useModuleSelector(selectMyOrgs);
	const activeOrgId = useActiveOrgId();
	return React.useMemo(
		() => orgs.find(org => org.id === activeOrgId) ?? null,
		[orgs, activeOrgId],
	);
}
