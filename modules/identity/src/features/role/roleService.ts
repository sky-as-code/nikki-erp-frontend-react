import { CommandResponse, fail, ok } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import * as t from './types';
import { ROLE_SCHEMA_NAME } from '../../constants';


type RoleServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

async function withRoleSchema<TData>(fn: (schema: dyn.SchemaPack) => Promise<TData>): RoleServiceResult<TData> {
	try {
		return ok(await dyn.withSchema(ROLE_SCHEMA_NAME, fn));
	}
	catch (error) {
		return fail(error);
	}
}

export function createRole(request: t.CreateRoleRequest): RoleServiceResult<t.CreateRoleResponse> {
	return withRoleSchema(schema => schema.restApi.create(request));
}

export function deleteRole(request: t.DeleteRoleRequest): RoleServiceResult<t.DeleteRoleResponse> {
	return withRoleSchema(schema => schema.restApi.delete(request));
}

export function getRoleSchema(): RoleServiceResult<t.GetRoleSchemaResponse> {
	return withRoleSchema(schema => schema.restApi.getModelSchema());
}

export function getRoleById(request: t.GetRoleByIdRequest): RoleServiceResult<t.GetRoleResponse> {
	return withRoleSchema(schema => schema.restApi.getById(request));
}

export function roleExists(request: t.RoleExistsRequest): RoleServiceResult<t.RoleExistsResponse> {
	return withRoleSchema(schema => schema.restApi.exists(request));
}

export function manageRoleEntitlements(
	request: t.ManageRoleEntitlementsRequest,
): RoleServiceResult<t.ManageRoleEntitlementsResponse> {
	return withRoleSchema(schema => schema.restApi.manageM2m(request, 'manage-entitlements'));
}

export function searchRoles(request: t.SearchRolesRequest): RoleServiceResult<t.SearchRolesResponse> {
	return withRoleSchema(schema => schema.restApi.search(request));
}

export function setRoleIsArchived(
	request: t.SetRoleIsArchivedRequest,
): RoleServiceResult<t.SetRoleIsArchivedResponse> {
	return withRoleSchema(schema => schema.restApi.setIsArchived(request));
}

export function updateRole(request: t.UpdateRoleRequest): RoleServiceResult<t.UpdateRoleResponse> {
	return withRoleSchema(schema => schema.restApi.update(request));
}
