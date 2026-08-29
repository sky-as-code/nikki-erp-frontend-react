import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `code` is immutable and unique, and is what a till names to open a sale. `is_system` marks
 * channels the platform creates for itself, which should not be edited by hand.
 */
export type SalesChannel = {
	id: string,
	code?: string,
	name?: string,
	description?: string,
	managed_by_module?: string,
	status?: string,
	is_system?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesChannelRequest = Record<string, any>;
export type CreateSalesChannelResponse = dyn.RestCreateResponse;

export type DeleteSalesChannelRequest = dyn.RestDeleteRequest;
export type DeleteSalesChannelResponse = dyn.RestDeleteResponse;

export type GetSalesChannelSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesChannelByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesChannelResponse = dyn.RestGetOneResponse<SalesChannel>;

export type SalesChannelExistsRequest = dyn.RestExistsRequest;
export type SalesChannelExistsResponse = dyn.RestExistsResponse;

export type SearchSalesChannelsRequest = dyn.RestSearchRequest;
export type SearchSalesChannelsResponse = dyn.RestSearchResponse<SalesChannel>;

export type UpdateSalesChannelRequest = dyn.RestUpdateRequest;
export type UpdateSalesChannelResponse = dyn.RestMutateResponse;
