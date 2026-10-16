import { createRoutePermissionMatcher } from '@nikkierp/ui/components';

import { authzRequirement } from '../permissions';

import type { AuthzArea, AuthzOperation } from '../permissions';
import type { RoutePermission } from '@nikkierp/ui/components';


function routePermission(area: AuthzArea, operation: AuthzOperation): RoutePermission {
	const { resource, action, scope } = authzRequirement(area, operation);
	return { resource, action, scope };
}

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
	'/overview': routePermission('resource', 'view'),
	'/resources': routePermission('resource', 'view'),
	'/resources/create': routePermission('resource', 'create'),
	'/resources/:resourceName': routePermission('resource', 'view'),
	'/actions': routePermission('action', 'view'),
	'/actions/create': routePermission('action', 'create'),
	'/actions/:actionId': routePermission('action', 'view'),
	'/entitlements': routePermission('entitlement', 'view'),
	'/entitlements/create': routePermission('entitlement', 'create'),
	'/entitlements/:entitlementId': routePermission('entitlement', 'view'),
	'/roles': routePermission('role', 'view'),
	'/roles/create': routePermission('role', 'create'),
	'/roles/:roleId': routePermission('role', 'view'),
	'/roles/:roleId/add-entitlements': routePermission('role', 'addEntitlement'),
	'/roles/:roleId/remove-entitlements': routePermission('role', 'removeEntitlement'),
	'/role-suites': routePermission('roleSuite', 'view'),
	'/role-suites/create': routePermission('roleSuite', 'create'),
	'/role-suites/:roleSuiteId': routePermission('roleSuite', 'view'),
	'/grant-requests': routePermission('grantRequest', 'view'),
	'/grant-requests/create': routePermission('grantRequest', 'create'),
	'/grant-requests/:grantRequestId': routePermission('grantRequest', 'view'),
	'/revoke-requests': routePermission('revokeRequest', 'view'),
	'/revoke-requests/create': routePermission('revokeRequest', 'create'),
	'/revoke-requests/:revokeRequestId': routePermission('revokeRequest', 'view'),
};

export const getRoutePermission = createRoutePermissionMatcher(ROUTE_PERMISSIONS);
