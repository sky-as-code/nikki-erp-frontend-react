import { CommandResponse, fail, ok } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import * as t from './types';
import { GROUP_SCHEMA_NAME } from '../../constants';


type GroupServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

async function withGroupSchema<TData>(fn: (schema: dyn.SchemaPack) => Promise<TData>): GroupServiceResult<TData> {
	try {
		return ok(await dyn.withSchema(GROUP_SCHEMA_NAME, fn));
	}
	catch (error) {
		return fail(error);
	}
}

export function createGroup(request: t.CreateGroupRequest): GroupServiceResult<t.CreateGroupResponse> {
	return withGroupSchema(schema => schema.restApi.create(request));
}

export function deleteGroup(request: t.DeleteGroupRequest): GroupServiceResult<t.DeleteGroupResponse> {
	return withGroupSchema(schema => schema.restApi.delete(request));
}

export function getGroupSchema(): GroupServiceResult<t.GetGroupSchemaResponse> {
	return withGroupSchema(schema => schema.restApi.getModelSchema());
}

export function getGroupById(request: t.GetGroupByIdRequest): GroupServiceResult<t.GetGroupResponse> {
	return withGroupSchema(schema => schema.restApi.getById(request));
}

export function groupExists(request: t.GroupExistsRequest): GroupServiceResult<t.GroupExistsResponse> {
	return withGroupSchema(schema => schema.restApi.exists(request));
}

export function manageGroupUsers(
	request: t.ManageGroupUsersRequest,
): GroupServiceResult<t.ManageGroupUsersResponse> {
	return withGroupSchema(schema => schema.restApi.manageM2m(request, 'manage-users'));
}

export function searchGroups(request: t.SearchGroupsRequest): GroupServiceResult<t.SearchGroupsResponse> {
	return withGroupSchema(schema => schema.restApi.search(request));
}

export function updateGroup(request: t.UpdateGroupRequest): GroupServiceResult<t.UpdateGroupResponse> {
	return withGroupSchema(schema => schema.restApi.update(request));
}
