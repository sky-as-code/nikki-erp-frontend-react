import { CommandResponse, fail, ok } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import { apiGet } from './http';
import * as c from '../constants';
import { Role } from './role/types';


/** A principal that can hold roles. The two flows differ only in this segment of the path. */
export type PrincipalKind = 'users' | 'groups';

export type SearchAssignedRolesRequest = dyn.RestSearchRequest & { id: string };
export type SearchAssignedRolesResponse = dyn.RestSearchResponse<Role>;

export type ManageRoleAssignmentsRequest = dyn.RestManageM2mRequest & { id: string };
export type ManageRoleAssignmentsResponse = dyn.RestMutateResponse;

/**
 * One entitlement of a described role, with every id already resolved to a display name by
 * `GET /roles/describe`. `scope_id` / `scope_name` are only present for the `org` and
 * `orgunit` scopes; `domain` and `private` carry no target and are labelled from a static
 * translation key.
 */
export type DescribedEntitlement = {
	id: string,
	resource_id?: string | null,
	resource_name?: string | null,
	action_id?: string | null,
	action_name?: string | null,
	scope?: string | null,
	scope_id?: string | null,
	scope_name?: string | null,
};

export type DescribedRole = {
	id: string,
	name?: string | null,
	entitlements: DescribedEntitlement[],
};

export type DescribeRolesRequest = { role_ids: string[] };
export type DescribeRolesResponse = { items: DescribedRole[] };

/** Matches `DescribeRolesMaxIds` in the backend role commands; exceeding it is a 400. */
export const DESCRIBE_ROLES_MAX_IDS = 20;

type ServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

async function attempt<TData>(fn: () => Promise<TData>): ServiceResult<TData> {
	try {
		return ok(await fn());
	}
	catch (error) {
		return fail(error);
	}
}

/** `GET /v1/iam/{users|groups}/:id/roles` — the roles currently assigned to one principal. */
export function searchAssignedRoles(
	kind: PrincipalKind, request: SearchAssignedRolesRequest,
): ServiceResult<SearchAssignedRolesResponse> {
	const { id, ...query } = request;
	return attempt(() => apiGet<SearchAssignedRolesResponse>(`v1/iam/${kind}/${id}/roles`, query));
}

/**
 * `POST /v1/iam/{users|groups}/:id/roles` — applies an add/remove delta.
 *
 * `manageM2m` appends its second argument to the schema's own resource path, so the principal
 * id goes there: the principal schema owns the route, not the role schema.
 */
export function manageRoleAssignments(
	kind: PrincipalKind, request: ManageRoleAssignmentsRequest,
): ServiceResult<ManageRoleAssignmentsResponse> {
	const { id, ...body } = request;
	return attempt(() => dyn.withSchema(
		principalSchemaName(kind),
		schema => schema.restApi.manageM2m(body, `${id}/roles`),
	));
}

function principalSchemaName(kind: PrincipalKind): string {
	return kind === 'users' ? c.USER_SCHEMA_NAME : c.GROUP_SCHEMA_NAME;
}

/**
 * `GET /v1/iam/roles/describe` — resolves roles into resource/action/scope display names for
 * the assignment confirmation stage. Callers must chunk by DESCRIBE_ROLES_MAX_IDS.
 */
export function describeRoles(request: DescribeRolesRequest): ServiceResult<DescribeRolesResponse> {
	return attempt(() => apiGet<DescribeRolesResponse>('v1/iam/roles/describe', {
		role_id: request.role_ids,
	}));
}
