import { selectSliceState, useModuleSelector, useServiceLayer } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { useActiveOrg } from './activeOrg';
import { selectMyOrgs } from './orgSelectors';
import { UserContextOrg } from './types';
import { UserContextService, userContextService } from './userContextService';


const selectUserContextState = selectSliceState(UserContextService);

/** The `getUserContext` request state, as `{status, data, clientErrors, error, doneAt}`. */
export const selectGetUserContext = createSelector(
	selectUserContextState,
	(state: any) => state?.getUserContext,
);

export function useGetUserContext() {
	return useServiceLayer(userContextService.getUserContext).result;
}

export function useUserContext() {
	return useGetUserContext().data;
}

export function useAccountSettings() {
	return useGetUserContext().data?.accountSettings ?? null;
}

export function useSystemSettings() {
	return useGetUserContext().data?.systemSettings ?? null;
}

export function useSetLocalSettings() {
	return useServiceLayer(userContextService.setLocalSettings);
}

export function useLocalSettings() {
	return useSetLocalSettings().result.data;
}

export function useFirstOrgSlug() {
	return useModuleSelector(selectFirstOrgSlug);
}
export function useMyOrgs() {
	return useModuleSelector(selectMyOrgs);
}
export function useFindMyOrg(orgSlug: string) {
	return useModuleSelector((state: any) => selectFindMyOrg(state, orgSlug));
}


/**
 * The active organization.
 *
 * Both of these used to resolve the org by matching the routing slice's `orgSlug` against the
 * org list. The org is no longer in the URL, so they delegate to `useActiveOrg`, which resolves
 * it from storage. Kept as-is rather than deleted: the remaining callers are in the deprecated
 * `authorize` module, and pointing them at the new source keeps them working without touching it.
 */
export const useActiveOrgWithDetails = () => useActiveOrg();

export const useActiveOrgDetail = () => useActiveOrg();

const selectFindMyOrg = createSelector(
	selectMyOrgs,
	(_: unknown, orgSlug: string) => orgSlug,
	(orgs: UserContextOrg[], orgSlug: string) => orgs.find(o => o.slug === orgSlug) ?? null,
);

const selectFirstOrgSlug = createSelector(
	selectMyOrgs,
	(myOrgs: UserContextOrg[]) => myOrgs[0]?.slug ?? null as (string | null),
);
