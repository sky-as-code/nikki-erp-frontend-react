import { ACTIONS, RESOURCES } from '@nikkierp/shell/userContext';
import { createRoutePermissionMatcher } from '@nikkierp/ui/components';

import type { RoutePermission } from '@nikkierp/ui/components';


export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
	'/overview': {
		resource: RESOURCES.AUTHZ_RESOURCE,
		action: ACTIONS.VIEW,
	},
	'/resources': {
		resource: RESOURCES.AUTHZ_RESOURCE,
		action: ACTIONS.VIEW,
	},
	'/resources/create': {
		resource: RESOURCES.AUTHZ_RESOURCE,
		action: ACTIONS.CREATE,
	},
	'/resources/:resourceName': {
		resource: RESOURCES.AUTHZ_RESOURCE,
		action: ACTIONS.VIEW,
	},
	'/actions': {
		resource: RESOURCES.AUTHZ_ACTION,
		action: ACTIONS.VIEW,
	},
	'/actions/create': {
		resource: RESOURCES.AUTHZ_ACTION,
		action: ACTIONS.CREATE,
	},
	'/actions/:actionId': {
		resource: RESOURCES.AUTHZ_ACTION,
		action: ACTIONS.VIEW,
	},
	'/entitlements': {
		resource: RESOURCES.AUTHZ_ENTITLEMENT,
		action: ACTIONS.VIEW,
	},
	'/entitlements/create': {
		resource: RESOURCES.AUTHZ_ENTITLEMENT,
		action: ACTIONS.CREATE,
	},
	'/entitlements/:entitlementId': {
		resource: RESOURCES.AUTHZ_ENTITLEMENT,
		action: ACTIONS.VIEW,
	},
	'/roles': {
		resource: RESOURCES.AUTHZ_ROLE,
		action: ACTIONS.VIEW,
	},
	'/roles/create': {
		resource: RESOURCES.AUTHZ_ROLE,
		action: ACTIONS.CREATE,
	},
	'/roles/:roleId': {
		resource: RESOURCES.AUTHZ_ROLE,
		action: ACTIONS.VIEW,
	},
	'/roles/:roleId/add-entitlements': {
		resource: RESOURCES.AUTHZ_ROLE,
		action: ACTIONS.UPDATE,
	},
	'/roles/:roleId/remove-entitlements': {
		resource: RESOURCES.AUTHZ_ROLE,
		action: ACTIONS.UPDATE,
	},
	'/role-suites': {
		resource: RESOURCES.AUTHZ_ROLE_SUITE,
		action: ACTIONS.VIEW,
	},
	'/role-suites/create': {
		resource: RESOURCES.AUTHZ_ROLE_SUITE,
		action: ACTIONS.CREATE,
	},
	'/role-suites/:roleSuiteId': {
		resource: RESOURCES.AUTHZ_ROLE_SUITE,
		action: ACTIONS.VIEW,
	},
	'/grant-requests': {
		resource: RESOURCES.AUTHZ_GRANT_REQUEST,
		action: ACTIONS.VIEW,
	},
	'/grant-requests/create': {
		resource: RESOURCES.AUTHZ_GRANT_REQUEST,
		action: ACTIONS.CREATE,
	},
	'/grant-requests/:grantRequestId': {
		resource: RESOURCES.AUTHZ_GRANT_REQUEST,
		action: ACTIONS.VIEW,
	},
	'/revoke-requests': {
		resource: RESOURCES.AUTHZ_REVOKE_REQUEST,
		action: ACTIONS.VIEW,
	},
	'/revoke-requests/create': {
		resource: RESOURCES.AUTHZ_REVOKE_REQUEST,
		action: ACTIONS.CREATE,
	},
	'/revoke-requests/:revokeRequestId': {
		resource: RESOURCES.AUTHZ_REVOKE_REQUEST,
		action: ACTIONS.VIEW,
	},
};

export const getRoutePermission = createRoutePermissionMatcher(ROUTE_PERMISSIONS);
