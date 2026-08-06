import { selectSliceState, useModuleSelector, useServiceLayer } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

// import { GLOBAL_CONTEXT_SLUG } from '../constants';
// import {
// 	ACTIONS,
// 	ACTIONS_FOR_SYSTEM_CONTEXT,
// 	MODULE_ACCESS_POLICY,
// 	RESOURCE_TO_MODULE,
// 	SYSTEM_CONTEXT_RESOURCES,
// } from './permissionConstants';
// import { hasFullAccess, hasPermission, hasPermissionAnyScope } from './permissionUtils';
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

// export const useHasPermission = (
// 	resource: string,
// 	action: string,
// 	contextScope?: any,
// ) => {
// 	const permissions = useSelector(selectPermissions);
// 	if (hasFullAccess(permissions)) return true;
// 	return hasPermission(permissions, resource, action, contextScope);
// };

export const useActiveOrgWithDetails = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

export const useActiveOrgDetail = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

// const selectPermissions = createSelector(
// 	selectUserContextState,
// 	(userContext: any) => userContext.getUserContext.data?.entitlements ?? [],
// );
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

// export const useHasAnyPermission = (
// 	resource: string,
// 	actions: string[] = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
// 	contextScope?: any,
// ) => {
// 	const permissions = useSelector(selectPermissions);
// 	if (hasFullAccess(permissions)) return true;
// 	return actions.some((action) => hasPermission(permissions, resource, action, contextScope));
// };


// function hasSystemContextPermissionForResource(
// 	permissions: string[],
// 	resource: string,
// ): boolean {
// 	return ACTIONS_FOR_SYSTEM_CONTEXT.some((action) => hasPermission(
// 		permissions,
// 		resource,
// 		action,
// 		{ scopeType: 'domain', scopeRef: '' },
// 	));
// }

// const collectSystemContextResources = (permissions: string[]) => {
// 	return SYSTEM_CONTEXT_RESOURCES.filter((resource) => hasSystemContextPermissionForResource(permissions, resource));
// };

// export const useHasGlobalContextAccess = () => {
// 	const permissions = useSelector(selectPermissions);
// 	if (hasFullAccess(permissions)) return true;
// 	return collectSystemContextResources(permissions).length > 0;
// };

// Backward-compatible alias. Prefer useHasGlobalContextAccess.
// export const useHasDomainAccess = useHasGlobalContextAccess;

// const collectModulesForResources = (resources: string[], modulesCatalog: any[]) => {
// 	const moduleSlugs = new Set(
// 		resources
// 			.map((resource) => RESOURCE_TO_MODULE[resource])
// 			.filter(Boolean),
// 	);
// 	return modulesCatalog.filter((mod) => moduleSlugs.has(mod.slug));
// };

type ResourcePermissionConfig = {
	resource: string,
	customActions?: Record<string, string>,
	contextScope?: any,
};

type ResourcePermissions<T extends Record<string, ResourcePermissionConfig>> = {
	[K in keyof T]: {
		canView: boolean,
		canCreate: boolean,
		canUpdate: boolean,
		canDelete: boolean,
		[key: string]: boolean,
	};
};

/**
 * Generic hook to check permissions for multiple resources
 * There are always 4 actions CRUD (View, Create, Update, Delete)
 * Can add custom actions through customActions
 *
 * @example
 * ```tsx
 * Basic usage
 * const permissions = useResourcePermissions({
 *   resource: { resource: RESOURCES.AUTHZ_RESOURCE },
 * });
 * permissions.resource.canView, canCreate, canUpdate, canDelete
 * ```
 *
 * @example
 * ```tsx
 * const permissions = useResourcePermissions({
 *   role: {
 *     resource: RESOURCES.AUTHZ_ROLE,
 *     customActions: {
 *       canAddEntitlement: ACTIONS.ADD_ENTITLEMENT,
 *       canRemoveEntitlement: ACTIONS.REMOVE_ENTITLEMENT,
 *     },
 *   },
 * });
 * permissions.role.canView, canCreate, canUpdate, canDelete, canAddEntitlement, canRemoveEntitlement
 * ```
 */
// export function useResourcePermissions<T extends Record<string, ResourcePermissionConfig>>(
// 	config: T,
// ): ResourcePermissions<T> {
// 	const result = {} as ResourcePermissions<T>;

// 	for (const [key, { resource, customActions = {}, contextScope }] of Object.entries(config)) {
// 		const permissionChecks: Record<string, boolean> = {
// 			canView: useHasPermission(resource, ACTIONS.VIEW, contextScope),
// 			canCreate: useHasPermission(resource, ACTIONS.CREATE, contextScope),
// 			canUpdate: useHasPermission(resource, ACTIONS.UPDATE, contextScope),
// 			canDelete: useHasPermission(resource, ACTIONS.DELETE, contextScope),
// 		};

// 		for (const [actionName, actionConstant] of Object.entries(customActions)) {
// 			permissionChecks[actionName] = useHasPermission(resource, actionConstant, contextScope);
// 		}

// 		result[key as keyof T] = permissionChecks as ResourcePermissions<T>[keyof T];
// 	}

// 	return result;
// }
