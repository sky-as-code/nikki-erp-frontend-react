import { selectSliceState, useModuleSelector, useServiceLayer } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { UserContextOrg } from './types';
import { UserContextService, userContextService } from './userContextService';
import { useActiveOrgModule } from '../routing';


const selectUserContextState = selectSliceState(UserContextService);

/** The `getUserContext` request state, as `{status, data, clientErrors, error, doneAt}`. */
export const selectGetUserContext = createSelector(
	selectUserContextState,
	(state: any) => state?.getUserContext,
);

export { selectMyOrgs };

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


export const useActiveOrgWithDetails = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

export const useActiveOrgDetail = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

const selectMyOrgs = createSelector(
	selectUserContextState,
	(state: any) => (state?.getUserContext?.data?.orgs ?? []) as UserContextOrg[],
);
const selectFindMyOrg = createSelector(
	selectMyOrgs,
	(_: unknown, orgSlug: string) => orgSlug,
	(orgs: UserContextOrg[], orgSlug: string) => orgs.find(o => o.slug === orgSlug) ?? null,
);

const selectFirstOrgSlug = createSelector(
	selectMyOrgs,
	(myOrgs: UserContextOrg[]) => myOrgs[0]?.slug ?? null as (string | null),
);
