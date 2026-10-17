import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import { apiGet } from '../http';


/** `iam_resource.name` / `iam_action.name` are langjson; older rows may still hold a plain string. */
export type PermissionName = dyn.ModelSchemaLangJson | string | null | undefined;

/** One `iam_entitlement` row of a role, with its resource and action edges projected. */
export type RoleEntitlement = {
	id: string,
	resource_id?: string | null,
	/** `null` is the `*` (all actions) grant. */
	action_id?: string | null,
	description?: string | null,
	resource?: { id?: string, code?: string, name?: PermissionName } | null,
	action?: { id?: string, code?: string, name?: PermissionName } | null,
};

export type GrantableResource = {
	id: string,
	code?: string,
	name?: PermissionName,
	max_scope?: string,
};

export type GrantableAction = {
	id: string,
	code?: string,
	name?: PermissionName,
	resource_id?: string,
};

export type SearchRoleEntitlementsRequest = { role_id: string };
export type SearchResourceActionsRequest = { resource_id: string };

/** The backend's `MODEL_RULE_PAGE_MAX_SIZE`; a role or a resource catalogue beyond it is not expected. */
const MAX_PAGE_SIZE = 500;

/*
 * The engine routes (`/v1/iam/{schema_name}`) rather than registered schemas: no React module owns
 * these schemas, and the section only needs one read of each. The edges ride the same request.
 */
const ENTITLEMENT_PATH = 'v1/iam/iam_entitlement';
const RESOURCE_PATH = 'v1/iam/iam_resource';
const ACTION_PATH = 'v1/iam/iam_action';

export function searchRoleEntitlements(
	request: SearchRoleEntitlementsRequest,
): Promise<ServiceResult<dyn.RestSearchResponse<RoleEntitlement>>> {
	return apiGet(ENTITLEMENT_PATH, {
		graph: { if: ['role_id', '=', request.role_id] },
		fields: [
			'id', 'resource_id', 'action_id', 'description',
			'resource.code', 'resource.name', 'action.code', 'action.name',
		],
		size: MAX_PAGE_SIZE,
	});
}

export function searchGrantableResources(): Promise<ServiceResult<dyn.RestSearchResponse<GrantableResource>>> {
	return apiGet(RESOURCE_PATH, {
		fields: ['id', 'code', 'name', 'max_scope'],
		size: MAX_PAGE_SIZE,
	});
}

export function searchResourceActions(
	request: SearchResourceActionsRequest,
): Promise<ServiceResult<dyn.RestSearchResponse<GrantableAction>>> {
	return apiGet(ACTION_PATH, {
		graph: { if: ['resource_id', '=', request.resource_id] },
		fields: ['id', 'code', 'name', 'resource_id'],
		size: MAX_PAGE_SIZE,
	});
}
