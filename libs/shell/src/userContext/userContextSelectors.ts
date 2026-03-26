import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { GLOBAL_CONTEXT_SLUG } from '../constants';
import {
	ACTIONS,
	ACTIONS_FOR_SYSTEM_CONTEXT,
	MODULE_ACCESS_POLICY,
	RESOURCE_TO_MODULE,
	SYSTEM_CONTEXT_RESOURCES,
} from './permissionConstants';
import { hasFullAccess, hasPermission, hasPermissionAnyScope } from './permissionUtils';
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
	if (moduleResources.length === 0) return true;
	const actionsToCheck = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE];
	const moduleAccessMode = MODULE_ACCESS_POLICY[moduleSlug] ?? 'strict_context';

	if (moduleAccessMode === 'any_scope') {
		return moduleResources.some((resource) =>
			actionsToCheck.some((action) => hasPermissionAnyScope(permissions, resource, action)),
		);
	}

	return moduleResources.some((resource) =>
		actionsToCheck.some((action) => hasPermission(permissions, resource, action)),
	);
};

export const useCanAccessModuleForContext = (
	moduleSlug: string,
	orgSlug?: string | null,
	contextScope?: { scopeType: PermissionScopeType; scopeRef: string },
) => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;

	const moduleResources = Object.entries(RESOURCE_TO_MODULE)
		.filter(([, slug]) => slug === moduleSlug)
		.map(([resource]) => resource);
	if (moduleResources.length === 0) return true;
	const actionsToCheck = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE];
	const moduleAccessMode = MODULE_ACCESS_POLICY[moduleSlug] ?? 'strict_context';

	if (orgSlug === GLOBAL_CONTEXT_SLUG) {
		const globalContextResources = collectSystemContextResources(permissions);
		const globalContextModuleResources =
			moduleResources.filter((resource) => globalContextResources.includes(resource));
		return globalContextModuleResources.some((resource) =>
			actionsToCheck.some((action) => hasPermission(permissions, resource, action, contextScope)),
		);
	}

	if (moduleAccessMode === 'any_scope') {
		return moduleResources.some((resource) =>
			actionsToCheck.some((action) => hasPermissionAnyScope(permissions, resource, action)),
		);
	}

	return moduleResources.some((resource) =>
		actionsToCheck.some((action) => hasPermission(permissions, resource, action, contextScope)),
	);
};

export const useActiveOrgWithDetails = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

export const useActiveOrgDetail = () => {
	const { orgSlug } = useActiveOrgModule();
	return useFindMyOrg(orgSlug ?? '');
};

export const useHasAnyPermission = (
	resource: string,
	actions: string[] = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
	contextScope?: { scopeType: PermissionScopeType; scopeRef: string },
) => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;
	return actions.some((action) => hasPermission(permissions, resource, action, contextScope));
};


function hasSystemContextPermissionForResource(
	permissions: UserContextState['permissions'],
	resource: string,
): boolean {
	return ACTIONS_FOR_SYSTEM_CONTEXT.some((action) => hasPermission(
		permissions,
		resource,
		action,
		{ scopeType: 'domain', scopeRef: '' },
	));
}

const collectSystemContextResources = (permissions: UserContextState['permissions']) => {
	return SYSTEM_CONTEXT_RESOURCES.filter((resource) => hasSystemContextPermissionForResource(permissions, resource));
};

export const useHasGlobalContextAccess = () => {
	const permissions = useSelector(selectPermissions);
	if (hasFullAccess(permissions)) return true;
	return collectSystemContextResources(permissions).length > 0;
};

// Backward-compatible alias. Prefer useHasGlobalContextAccess.
export const useHasDomainAccess = useHasGlobalContextAccess;

const collectModulesForResources = (resources: string[], modulesCatalog: Module[]) => {
	const moduleSlugs = new Set(
		resources
			.map((resource) => RESOURCE_TO_MODULE[resource])
			.filter(Boolean),
	);
	return modulesCatalog.filter((mod) => moduleSlugs.has(mod.slug));
};

export const useMyModulesForContext = (orgSlug?: string | null) => {
	const permissions = useSelector(selectPermissions);
	const orgs = useSelector(selectMyOrgs);

	if (orgSlug === GLOBAL_CONTEXT_SLUG) {
		if (hasFullAccess(permissions)) {
			return DEFAULT_MODULES;
		}

		const resources = collectSystemContextResources(permissions);
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

	// ? COMMENTED FOR TESTING ONLY
	// For org context, only include resources that are not domain-scoped
	// const resources = collectResourcesByNonDomainScope(permissions);
	// return collectModulesForResources(resources, orgModules);

	return orgModules;
};

type ResourcePermissionConfig = {
	resource: string;
	customActions?: Record<string, string>;
	contextScope?: { scopeType: PermissionScopeType; scopeRef: string };
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
export function useResourcePermissions<T extends Record<string, ResourcePermissionConfig>>(
	config: T,
): ResourcePermissions<T> {
	const result = {} as ResourcePermissions<T>;

	for (const [key, { resource, customActions = {}, contextScope }] of Object.entries(config)) {
		const permissionChecks: Record<string, boolean> = {
			canView: useHasPermission(resource, ACTIONS.VIEW, contextScope),
			canCreate: useHasPermission(resource, ACTIONS.CREATE, contextScope),
			canUpdate: useHasPermission(resource, ACTIONS.UPDATE, contextScope),
			canDelete: useHasPermission(resource, ACTIONS.DELETE, contextScope),
		};

		for (const [actionName, actionConstant] of Object.entries(customActions)) {
			permissionChecks[actionName] = useHasPermission(resource, actionConstant, contextScope);
		}

		result[key as keyof T] = permissionChecks as ResourcePermissions<T>[keyof T];
	}

	return result;
}
