import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `sales_channel_id` is immutable once set: every order through the point records that channel, so
 * moving a point between channels rewrites the provenance of sales already made.
 */
export type SalesPoint = {
	id: string,
	sales_channel_id?: string,
	name?: string,
	code?: string,
	external_reference_id?: string,
	external_reference_type?: string,
	status?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPointRequest = Record<string, any>;
export type CreateSalesPointResponse = dyn.RestCreateResponse;

export type DeleteSalesPointRequest = dyn.RestDeleteRequest;
export type DeleteSalesPointResponse = dyn.RestDeleteResponse;

export type GetSalesPointSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPointByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPointResponse = dyn.RestGetOneResponse<SalesPoint>;

export type SalesPointExistsRequest = dyn.RestExistsRequest;
export type SalesPointExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPointsRequest = dyn.RestSearchRequest;
export type SearchSalesPointsResponse = dyn.RestSearchResponse<SalesPoint>;

export type UpdateSalesPointRequest = dyn.RestUpdateRequest;
export type UpdateSalesPointResponse = dyn.RestMutateResponse;
