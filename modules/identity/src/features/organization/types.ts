import * as dyn from '@nikkierp/common/dynamic_model';


export type Organization = {
	id: string;
	address?: string;
	display_name?: string;
	legal_name?: string;
	phone_number?: string;
	slug?: string;
	etag?: string;
	created_at?: string;
	updated_at?: string;
};

export type CreateOrgRequest = Organization & Record<string, any>;
export type CreateOrgResponse = dyn.RestCreateResponse;

export type DeleteOrgRequest = dyn.RestDeleteRequest;
export type DeleteOrgResponse = dyn.RestDeleteResponse;

export type GetOrgSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetOrgByIdRequest = dyn.RestGetByIdRequest;
export type GetOrgBySlugRequest = dyn.RequestWithFields & {
	slug: string,
};
export type GetOrgResponse = dyn.RestGetOneResponse<Organization>;

export type ManageOrgUsersRequest = dyn.RestManageM2mRequest;
export type ManageOrgUsersResponse = dyn.RestMutateResponse;

export type OrgExistsRequest = dyn.RestExistsRequest;
export type OrgExistsResponse = dyn.RestExistsResponse;

export type SearchOrgRequest = dyn.RestSearchRequest;
export type SearchOrgResponse = dyn.RestSearchResponse<Organization>;

export type SetOrgIsArchivedRequest = dyn.RestSetIsArchivedRequest;
export type SetOrgIsArchivedResponse = dyn.RestMutateResponse;

export type UpdateOrgRequest = dyn.RestUpdateRequest;
export type UpdateOrgResponse = dyn.RestMutateResponse;
