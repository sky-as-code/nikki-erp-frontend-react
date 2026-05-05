import * as dyn from '@nikkierp/common/dynamic_model';


export type Group = {
	id: string,
	name?: string,
	description?: string,
	owner_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateGroupRequest = Record<string, any>;
export type CreateGroupResponse = dyn.RestCreateResponse;

export type DeleteGroupRequest = dyn.RestDeleteRequest;
export type DeleteGroupResponse = dyn.RestDeleteResponse;

export type GetGroupSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetGroupByIdRequest = dyn.RestGetByIdRequest;
export type GetGroupResponse = dyn.RestGetOneResponse<Group>;

export type GroupExistsRequest = dyn.RestExistsRequest;
export type GroupExistsResponse = dyn.RestExistsResponse;

export type ManageGroupUsersRequest = dyn.RestManageM2mRequest;
export type ManageGroupUsersResponse = dyn.RestMutateResponse;

export type SearchGroupsRequest = dyn.RestSearchRequest;
export type SearchGroupsResponse = dyn.RestSearchResponse<Group>;

export type UpdateGroupRequest = dyn.RestUpdateRequest;
export type UpdateGroupResponse = dyn.RestMutateResponse;
