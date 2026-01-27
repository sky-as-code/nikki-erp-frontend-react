import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { ACTIONS, RESOURCE_TO_MODULE } from './permissionConstants';
import { hasFullAccess, hasPermission } from './permissionUtils';
import { Module, Organization, PermissionScopeType } from './userContextService';
import { UserContextState } from './userContextSlice';

import type { RootState } from '../appState/store';


export const selectUserContext = (state: RootState) => state.shellUserContext;
const selectPermissions = createSelector(
	selectUserContext,
	(userContext: UserContextState) => userContext.permissions,
);
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

export const useHasPermission = (
	resource: string,
	action: string,
	contextScope?: { scopeType: PermissionScopeType; scopeRef: string },
) => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;
	return hasPermission(permissions, resource, action, contextScope);
};

export const useCanAccessModule = (moduleSlug: string) => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;
	const moduleResources = Object.entries(RESOURCE_TO_MODULE)
		.filter(([, slug]) => slug === moduleSlug)
		.map(([resource]) => resource);
	const actionsToCheck = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE];

	return moduleResources.some((resource) =>
		actionsToCheck.some((action) => hasPermission(permissions, resource, action)),
	);
};

export const useActiveOrgWithDetails = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

export const useHasAnyPermission = (
	resource: string,
	actions: string[] = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
) => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;
	return actions.some((action) => hasPermission(permissions, resource, action));
};

type ResourcePermissionConfig = {
	resource: string;
	customActions?: Record<string, string>; // Map action name -> action constant
};

type ResourcePermissions<T extends Record<string, ResourcePermissionConfig>> = {
	[K in keyof T]: {
		canView: boolean;
		canCreate: boolean;
		canUpdate: boolean;
		canDelete: boolean;
		[key: string]: boolean; // Cho custom actions
	};
};

/**
 * Generic hook to check permissions for multiple resources
 * There are always 4 actions CRUD (View, Create, Update, Delete)
 * Can add custom actions through customActions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const permissions = useResourcePermissions({
 *   resource: { resource: RESOURCES.AUTHZ_RESOURCE },
 * });
 * // permissions.resource.canView, canCreate, canUpdate, canDelete
 * ```
 *
 * @example
 * ```tsx
 * // const permissions = useResourcePermissions({
 *   role: {
 *     resource: RESOURCES.AUTHZ_ROLE,
 *     customActions: {
 *       canAddEntitlement: ACTIONS.ADD_ENTITLEMENT,
 *       canRemoveEntitlement: ACTIONS.REMOVE_ENTITLEMENT,
 *     },
 *   },
 * });
 * // permissions.role.canView, canCreate, canUpdate, canDelete, canAddEntitlement, canRemoveEntitlement
 * ```
 */
export function useResourcePermissions<T extends Record<string, ResourcePermissionConfig>>(
	config: T,
): ResourcePermissions<T> {
	const result = {} as ResourcePermissions<T>;

	for (const [key, { resource, customActions = {} }] of Object.entries(config)) {
		const permissionChecks: Record<string, boolean> = {
			canView: useHasPermission(resource, ACTIONS.VIEW),
			canCreate: useHasPermission(resource, ACTIONS.CREATE),
			canUpdate: useHasPermission(resource, ACTIONS.UPDATE),
			canDelete: useHasPermission(resource, ACTIONS.DELETE),
		};

		for (const [actionName, actionConstant] of Object.entries(customActions)) {
			permissionChecks[actionName] = useHasPermission(resource, actionConstant);
		}

		result[key as keyof T] = permissionChecks as ResourcePermissions<T>[keyof T];
	}

	return result;
}
