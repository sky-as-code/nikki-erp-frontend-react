import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { GLOBAL_CONTEXT_SLUG } from '../constants';
import { ACTIONS, RESOURCE_TO_MODULE } from './permissionConstants';
import { hasFullAccess, hasPermission } from './permissionUtils';
import { DEFAULT_MODULES, Module, Organization, PermissionScopeType } from './userContextService';
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
export const useMyModules = (orgSlug: string) => useMyModulesForContext(orgSlug);
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

export const useCanAccessModuleForContext = (moduleSlug: string, orgSlug?: string | null) => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;

	const moduleResources = Object.entries(RESOURCE_TO_MODULE)
		.filter(([, slug]) => slug === moduleSlug)
		.map(([resource]) => resource);
	const actionsToCheck = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE];

	if (orgSlug === GLOBAL_CONTEXT_SLUG) {
		const domainResources = collectResourcesByScopeType(permissions, 'domain');
		const domainModuleResources = moduleResources.filter((resource) => domainResources.includes(resource));
		return domainModuleResources.some((resource) =>
			actionsToCheck.some((action) => hasPermission(permissions, resource, action)),
		);
	}

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

const hasDomainPermissionEntry = (permissions: UserContextState['permissions']) => {
	return Object.values(permissions).some((entries) =>
		entries.some((entry) => entry.scopeType === 'domain'),
	);
};

export const useHasDomainAccess = () => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;
	return hasDomainPermissionEntry(permissions);
};

const collectModulesForResources = (resources: string[], modulesCatalog: Module[]) => {
	const moduleSlugs = new Set(
		resources
			.map((resource) => RESOURCE_TO_MODULE[resource])
			.filter(Boolean),
	);
	return modulesCatalog.filter((mod) => moduleSlugs.has(mod.slug));
};

const collectResourcesByScopeType = (
	permissions: UserContextState['permissions'],
	scopeType: PermissionScopeType,
) => {
	return Object.entries(permissions)
		.filter(([, entries]) => entries.some((entry) => entry.scopeType === scopeType))
		.map(([resource]) => resource);
};

const collectResourcesWithAnyScope = (permissions: UserContextState['permissions']) => {
	return Object.entries(permissions)
		.filter(([, entries]) => entries.length > 0)
		.map(([resource]) => resource);
};

export const useMyModulesForContext = (orgSlug?: string | null) => {
	const permissions = useSelector(selectPermissions);
	const orgs = useSelector(selectMyOrgs);

	if (orgSlug === GLOBAL_CONTEXT_SLUG) {
		if (hasFullAccess(permissions)) {
			return DEFAULT_MODULES;
		}

		const resources = collectResourcesByScopeType(permissions, 'domain');
		const modulesCatalog = orgs.length > 0
			? Array.from(new Map(orgs.flatMap(org => org.modules).map(mod => [mod.slug, mod])).values())
			: DEFAULT_MODULES;
		return collectModulesForResources(resources, modulesCatalog);
	}

	const orgModules = orgSlug
		? (orgs.find((org) => org.slug === orgSlug)?.modules ?? [])
		: [];
	if (hasFullAccess(permissions)) {
		return orgModules;
	}

	const resources = collectResourcesWithAnyScope(permissions);
	return collectModulesForResources(resources, orgModules);
};

type ResourcePermissionConfig = {
	resource: string;
	customActions?: Record<string, string>;
};

type ResourcePermissions<T extends Record<string, ResourcePermissionConfig>> = {
	[K in keyof T]: {
		canView: boolean;
		canCreate: boolean;
		canUpdate: boolean;
		canDelete: boolean;
		[key: string]: boolean;
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
