import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { Module, Organization } from './userContextService';
import { UserContextState } from './userContextSlice';

import type { RootState } from '../appState/store';


export const selectUserContext = (state: RootState) => state.shellUserContext;
const selectMyOrgs = createSelector(
	selectUserContext,
	(userContext: UserContextState) => userContext.orgs,
);
const selectFindMyOrg = createSelector(
	selectMyOrgs,
	(_, orgSlug: string) => orgSlug,
	(orgs: Organization[], orgSlug) => orgs.find(o => o.slug === orgSlug) ?? null,
);
const selectMyModules = createSelector(
	selectUserContext,
	(_, orgSlug: string) => orgSlug,
	(userContext: UserContextState, orgSlug) => userContext.orgs.find(o => o.slug === orgSlug)?.modules ?? [],
);

const selectFindMyModule = createSelector(
	(state: RootState, orgSlug: string, _moduleSlug: string) => // Input selectors must have same number or args.
		selectMyModules(state, orgSlug),
	(_, __, moduleSlug: string) => moduleSlug,
	(modules: Module[], moduleSlug) => modules.find(m => m.slug === moduleSlug) ?? null,
);
const selectFirstOrgSlug = createSelector(
	selectUserContext,
	(userContext: UserContextState) => ({
		slug: userContext.orgs[0]?.slug ?? null as (string | null),
		isLoading: userContext.isLoading,
	}),
);

export { selectMyOrgs };
export const useFirstOrgSlug = () => useSelector(selectFirstOrgSlug);
export const useUserContext = () => useSelector(selectUserContext);
export const useMyOrgs = () => useSelector(selectMyOrgs);
export const useFindMyOrg = (orgSlug: string) => useSelector(state => selectFindMyOrg(state, orgSlug));
export const useMyModules = (orgSlug: string) => useSelector(state => selectMyModules(state, orgSlug));
export const useFindMyModule = (orgSlug: string, moduleSlug: string) => {
	return useSelector(state => selectFindMyModule(state, orgSlug, moduleSlug));
};

export const useActiveOrgWithDetails = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};
