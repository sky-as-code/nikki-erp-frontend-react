import * as dyn from '@nikkierp/common/dynamic_model';
import * as uiState from '@nikkierp/ui/appState';

import * as t from './types';
import { USER_SCHEMA_NAME } from '../../constants';


export const createUser = uiState.createSchemaThunkPack<t.CreateUserResponse, t.CreateUserRequest, 'createUser'>(
	USER_SCHEMA_NAME, 'createUser',
	async function createUserThunk(schema: dyn.SchemaPack, request: t.CreateUserRequest) {
		return schema.restApi.create(request);
	},
);

export const deleteUser = uiState.createSchemaThunkPack<t.DeleteUserResponse, t.DeleteUserRequest, 'deleteUser'>(
	USER_SCHEMA_NAME, 'deleteUser',
	async function deleteUserThunk(schema: dyn.SchemaPack, request: t.DeleteUserRequest) {
		return schema.restApi.delete(request);
	},
);

export const getUserSchema = uiState.createSchemaThunkPack<t.GetUserSchemaResponse, void, 'getUserSchema'>(
	USER_SCHEMA_NAME, 'getUserSchema',
	async function getUserSchemaThunk(schema: dyn.SchemaPack) {
		return schema.restApi.getModelSchema();
	},
);

export const getUserById = uiState.createSchemaThunkPack<t.GetUserResponse, t.GetUserByIdRequest, 'getUserById'>(
	USER_SCHEMA_NAME, 'getUserById',
	async function getUserByIdThunk(schema: dyn.SchemaPack, request: t.GetUserByIdRequest) {
		return schema.restApi.getById(request);
	},
);

export const searchUsers = uiState.createSchemaThunkPack<t.SearchUserResponse, t.SearchUserRequest, 'searchUsers'>(
	USER_SCHEMA_NAME, 'searchUsers',
	async function searchUsersThunk(schema: dyn.SchemaPack, request: t.SearchUserRequest) {
		return schema.restApi.search(request);
	},
);

export const setUserIsArchived = uiState.createSchemaThunkPack<
	t.SetUserIsArchivedResponse, t.SetUserIsArchivedRequest, 'setUserIsArchived'
>(
	USER_SCHEMA_NAME, 'setUserIsArchived',
	async function setUserIsArchivedThunk(schema: dyn.SchemaPack, request: t.SetUserIsArchivedRequest) {
		return schema.restApi.setIsArchived(request);
	},
);

export const userExists = uiState.createSchemaThunkPack<t.UserExistsResponse, t.UserExistsRequest, 'userExists'>(
	USER_SCHEMA_NAME, 'userExists',
	async function userExistsThunk(schema: dyn.SchemaPack, request: t.UserExistsRequest) {
		return schema.restApi.exists(request);
	},
);

export const updateUser = uiState.createSchemaThunkPack<t.UpdateUserResponse, t.UpdateUserRequest, 'updateUser'>(
	USER_SCHEMA_NAME, 'updateUser',
	async function updateUserThunk(schema: dyn.SchemaPack, request: t.UpdateUserRequest) {
		return schema.restApi.update(request);
	},
);

// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440000',
// 		email: 'john.doe@example.com',
// 		displayName: 'John Wick',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440001',
// 		email: 'jane.smith@example.com',
// 		displayName: 'Jane Smith',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440002',
// 		email: 'michael.johnson@example.com',
// 		displayName: 'Michael Johnson',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440003',
// 		email: 'sarah.williams@example.com',
// 		displayName: 'Sarah Williams',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440004',
// 		email: 'david.brown@example.com',
// 		displayName: 'David Brown',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440005',
// 		email: 'emily.davis@example.com',
// 		displayName: 'Emily Davis',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// ];
// const data: User[] = [
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440000',
// 		email: 'john.doe@example.com',
// 		displayName: 'John Wick',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440001',
// 		email: 'jane.smith@example.com',
// 		displayName: 'Jane Smith',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440002',
// 		email: 'michael.johnson@example.com',
// 		displayName: 'Michael Johnson',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440003',
// 		email: 'sarah.williams@example.com',
// 		displayName: 'Sarah Williams',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440004',
// 		email: 'david.brown@example.com',
// 		displayName: 'David Brown',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440005',
// 		email: 'emily.davis@example.com',
// 		displayName: 'Emily Davis',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// ];