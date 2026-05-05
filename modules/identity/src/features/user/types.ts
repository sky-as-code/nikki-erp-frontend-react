import * as dyn from '@nikkierp/common/dynamic_model';


export type User = {
	id: string;
	avatar_url?: string;
	display_name?: string;
	email?: string;
	status?: any;
	etag?: string;
	created_at?: string;
	updated_at?: string;

	groups?: any[];
	orgUnit?: any;
};

export type CreateUserRequest = Record<string, any>;
export type CreateUserResponse = dyn.RestCreateResponse;

export type DeleteUserRequest = dyn.RestDeleteRequest;
export type DeleteUserResponse = dyn.RestDeleteResponse;

export type GetUserSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetUserByIdRequest = dyn.RestGetByIdRequest;
export type GetUserResponse = dyn.RestGetOneResponse<User>;

export type SearchUserRequest = dyn.RestSearchRequest;
export type SearchUserResponse = dyn.RestSearchResponse<User>;

export type SetUserIsArchivedRequest = dyn.RestSetIsArchivedRequest;
export type SetUserIsArchivedResponse = dyn.RestMutateResponse;

export type UserExistsRequest = dyn.RestExistsRequest;
export type UserExistsResponse = dyn.RestExistsResponse;

export type UpdateUserRequest = dyn.RestUpdateRequest;
export type UpdateUserResponse = dyn.RestMutateResponse;
