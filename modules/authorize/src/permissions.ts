import { ResourceScope } from '@nikkierp/common/entitlements';

import type { EntitlementRequirement } from '@nikkierp/common/entitlements';


/**
 * The backend resource each authorize area is guarded by. These are the iam schema names the
 * application services assert, all tenant-scoped (`iam_role`, `iam_entitlement`, `iam_resource`,
 * `iam_grant_request` declare `ResourceScopeTenant`).
 *
 * Two areas have no resource of their own on the backend: role suites are role management, and a
 * revoke request is the counterpart of a grant request, so each borrows its sibling's resource.
 */
const AREA_RESOURCE = {
	resource: 'iam_resource',
	action: 'iam_resource',
	entitlement: 'iam_entitlement',
	role: 'iam_role',
	roleSuite: 'iam_role',
	grantRequest: 'iam_grant_request',
	revokeRequest: 'iam_grant_request',
} as const;

export type AuthzArea = keyof typeof AREA_RESOURCE;

export type AuthzOperation = 'view' | 'create' | 'update' | 'delete'
	| 'addEntitlement' | 'removeEntitlement' | 'respond';

const OPERATION_CODE: Record<AuthzOperation, string> = {
	view: 'read',
	create: 'create',
	update: 'update',
	delete: 'delete',
	addEntitlement: 'manage_entitlements',
	removeEntitlement: 'manage_entitlements',
	respond: 'update',
};

/** An action is a child of its resource: the backend asserts `manage_actions` on it for any write. */
function actionCodeFor(area: AuthzArea, operation: AuthzOperation): string {
	if (area === 'action' && operation !== 'view') {
		return 'manage_actions';
	}
	return OPERATION_CODE[operation];
}

export function authzRequirement(area: AuthzArea, operation: AuthzOperation): EntitlementRequirement {
	return { action: actionCodeFor(area, operation), resource: AREA_RESOURCE[area], scope: ResourceScope.Tenant };
}
