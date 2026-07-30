import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Mirrors the backend `iam_role` schema
 * (backend `nikkierp/modules/iam/domain/models/role.go`). Exactly one of
 * `owner_user_id` / `owner_group_id` must be set — the backend enforces it via
 * `ExclusiveRequiredFields`.
 */
export type Role = {
	id: string,
	name?: dyn.ModelSchemaLangJson,
	description?: dyn.ModelSchemaLangJson,
	owner_user_id?: string,
	owner_group_id?: string,
	is_private?: boolean,
	is_requestable?: boolean,
	is_required_attachment?: boolean,
	is_required_comment?: boolean,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateRoleRequest = Record<string, any>;
export type CreateRoleResponse = dyn.RestCreateResponse;

export type DeleteRoleRequest = dyn.RestDeleteRequest;
export type DeleteRoleResponse = dyn.RestDeleteResponse;

export type GetRoleSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetRoleByIdRequest = dyn.RestGetByIdRequest;
export type GetRoleResponse = dyn.RestGetOneResponse<Role>;

export type RoleExistsRequest = dyn.RestExistsRequest;
export type RoleExistsResponse = dyn.RestExistsResponse;

export type ManageRoleEntitlementsRequest = dyn.RestManageM2mRequest;
export type ManageRoleEntitlementsResponse = dyn.RestMutateResponse;

export type SearchRolesRequest = dyn.RestSearchRequest;
export type SearchRolesResponse = dyn.RestSearchResponse<Role>;

export type SetRoleIsArchivedRequest = dyn.RestSetIsArchivedRequest;
export type SetRoleIsArchivedResponse = dyn.RestMutateResponse;

export type UpdateRoleRequest = dyn.RestUpdateRequest;
export type UpdateRoleResponse = dyn.RestMutateResponse;
