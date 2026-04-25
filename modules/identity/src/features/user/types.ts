import * as dyn from '@nikkierp/common/dynamic_model';


export type CreateUserRequest = Record<string, any>;
export type CreateUserResponse = dyn.RestCreateResponse;

export type DeleteUserRequest = dyn.RestDeleteRequest;
export type DeleteUserResponse = dyn.RestDeleteResponse;

export type GetUserSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetUserRequest = dyn.RestGetOneRequest;
export type GetUserResponse = dyn.RestGetOneResponse;

export type SearchUserRequest = dyn.RestSearchRequest;
export type SearchUserResponse = dyn.RestSearchResponse;

export type SetUserIsArchivedRequest = dyn.RestSetIsArchivedRequest;
export type SetUserIsArchivedResponse = dyn.RestMutateResponse;

export type UserExistsRequest = dyn.RestExistsRequest;
export type UserExistsResponse = dyn.RestExistsResponse;

export type UpdateUserRequest = dyn.RestUpdateRequest;
export type UpdateUserResponse = dyn.RestMutateResponse;

export type User = {
	id?: string;
	displayName?: string;
	email?: string;
	avatarUrl?: string;
	etag?: string;
	status?: any;
	createdAt?: string;
	updatedAt?: string;

	groups?: any[];
	orgUnit?: any;
};
