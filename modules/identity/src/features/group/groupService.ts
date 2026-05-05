import * as dyn from '@nikkierp/common/dynamic_model';
import * as uiState from '@nikkierp/ui/appState';

import * as t from './types';
import { GROUP_SCHEMA_NAME } from '../../constants';


export const createGroup = uiState.createSchemaThunkPack<t.CreateGroupResponse, t.CreateGroupRequest, 'createGroup'>(
	GROUP_SCHEMA_NAME, 'createGroup',
	async function createGroupThunk(schema: dyn.SchemaPack, request: t.CreateGroupRequest) {
		return schema.restApi.create(request);
	},
);

export const deleteGroup = uiState.createSchemaThunkPack<t.DeleteGroupResponse, t.DeleteGroupRequest, 'deleteGroup'>(
	GROUP_SCHEMA_NAME, 'deleteGroup',
	async function deleteGroupThunk(schema: dyn.SchemaPack, request: t.DeleteGroupRequest) {
		return schema.restApi.delete(request);
	},
);

export const getGroupSchema = uiState.createSchemaThunkPack<t.GetGroupSchemaResponse, void, 'getGroupSchema'>(
	GROUP_SCHEMA_NAME, 'getGroupSchema',
	async function getGroupSchemaThunk(schema: dyn.SchemaPack) {
		return schema.restApi.getModelSchema();
	},
);

export const getGroupById = uiState.createSchemaThunkPack<t.GetGroupResponse, t.GetGroupByIdRequest, 'getGroupById'>(
	GROUP_SCHEMA_NAME, 'getGroupById',
	async function getGroupByIdThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.getById(request);
	},
);

export const groupExists = uiState.createSchemaThunkPack<t.GroupExistsResponse, t.GroupExistsRequest, 'groupExists'>(
	GROUP_SCHEMA_NAME, 'groupExists',
	async function groupExistsThunk(schema: dyn.SchemaPack, request: t.GroupExistsRequest) {
		return schema.restApi.exists(request);
	},
);

export const manageGroupUsers = uiState.createSchemaThunkPack<
	t.ManageGroupUsersResponse, t.ManageGroupUsersRequest, 'manageGroupUsers'
>(
	GROUP_SCHEMA_NAME, 'manageGroupUsers',
	async function manageGroupUsersThunk(schema: dyn.SchemaPack, request: t.ManageGroupUsersRequest) {
		return schema.restApi.manageM2m(request, 'manage-users');
	},
);

export const searchGroups = uiState.createSchemaThunkPack<
	t.SearchGroupsResponse, t.SearchGroupsRequest, 'searchGroups'
>(
	GROUP_SCHEMA_NAME, 'searchGroups',
	async function searchGroupsThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.search(request);
	},
);

export const updateGroup = uiState.createSchemaThunkPack<t.UpdateGroupResponse, t.UpdateGroupRequest, 'updateGroup'>(
	GROUP_SCHEMA_NAME, 'updateGroup',
	async function updateGroupThunk(schema: dyn.SchemaPack, request: t.UpdateGroupRequest) {
		return schema.restApi.update(request);
	},
);
