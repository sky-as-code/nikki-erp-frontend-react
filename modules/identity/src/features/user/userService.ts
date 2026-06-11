import { CommandResponse, fail, ok } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import * as t from './types';
import { USER_SCHEMA_NAME } from '../../constants';


type UserServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

/** Resolves the user schema then runs `fn`, wrapping the outcome into a `CommandResponse`. */
async function withUserSchema<TData>(fn: (schema: dyn.SchemaPack) => Promise<TData>): UserServiceResult<TData> {
	try {
		const schema = await dyn.schemaRegistry.get(USER_SCHEMA_NAME);
		if (!schema) {
			return fail(new Error(`Schema "${USER_SCHEMA_NAME}" is not registered.`));
		}
		return ok(await fn(schema));
	}
	catch (error) {
		return fail(error);
	}
}

export function createUser(request: t.CreateUserRequest): UserServiceResult<t.CreateUserResponse> {
	return withUserSchema(schema => schema.restApi.create(request));
}

export function deleteUser(request: t.DeleteUserRequest): UserServiceResult<t.DeleteUserResponse> {
	return withUserSchema(schema => schema.restApi.delete(request));
}

export function getUserSchema(): UserServiceResult<t.GetUserSchemaResponse> {
	return withUserSchema(schema => schema.restApi.getModelSchema());
}

export function getUserById(request: t.GetUserByIdRequest): UserServiceResult<t.GetUserResponse> {
	return withUserSchema(schema => schema.restApi.getById(request));
}

export function searchUsers(request: t.SearchUserRequest): UserServiceResult<t.SearchUserResponse> {
	return withUserSchema(async (schema) => {
		const response = await schema.restApi.search(request);
		if (response.items) {
			response.desired_fields.push('password');
			for (let i = 0; i < response.items.length; i++) {
				response.items[i].password = null;
			}
		}
		return response;
	});
}

export function setUserIsArchived(
	request: t.SetUserIsArchivedRequest,
): UserServiceResult<t.SetUserIsArchivedResponse> {
	return withUserSchema(schema => schema.restApi.setIsArchived(request));
}

export function userExists(request: t.UserExistsRequest): UserServiceResult<t.UserExistsResponse> {
	return withUserSchema(schema => schema.restApi.exists(request));
}

export function updateUser(request: t.UpdateUserRequest): UserServiceResult<t.UpdateUserResponse> {
	return withUserSchema(schema => schema.restApi.update(request));
}

/* Status updates reuse the generic update endpoint. */

export function activateUser(request: t.ActivateUserRequest): UserServiceResult<t.ActivateUserResponse> {
	return withUserSchema(schema => schema.restApi.update(request));
}

export function inviteUser(request: t.InviteUserRequest): UserServiceResult<t.InviteUserResponse> {
	return withUserSchema(schema => schema.restApi.update(request));
}

export function suspendUser(request: t.SuspendUserRequest): UserServiceResult<t.SuspendUserResponse> {
	return withUserSchema(schema => schema.restApi.update(request));
}
