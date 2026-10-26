import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Scoped to a channel, a point, or neither, and specificity beats priority: a point-scoped
 * pricelist wins over a channel-scoped one whatever their priorities say.
 */
export type SalesPricelist = {
	id: string,
	code?: string,
	name?: string,
	description?: string,
	currency_id?: string,
	is_default?: string,
	sales_channel_id?: string,
	sales_point_id?: string,
	valid_from?: string,
	valid_until?: string,
	priority?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPricelistRequest = Record<string, any>;
export type CreateSalesPricelistResponse = dyn.RestCreateResponse;

export type DeleteSalesPricelistRequest = dyn.RestDeleteRequest;
export type DeleteSalesPricelistResponse = dyn.RestDeleteResponse;

export type GetSalesPricelistSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPricelistByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPricelistResponse = dyn.RestGetOneResponse<SalesPricelist>;

export type SalesPricelistExistsRequest = dyn.RestExistsRequest;
export type SalesPricelistExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPricelistsRequest = dyn.RestSearchRequest;
export type SearchSalesPricelistsResponse = dyn.RestSearchResponse<SalesPricelist>;

export type UpdateSalesPricelistRequest = dyn.RestUpdateRequest;
export type UpdateSalesPricelistResponse = dyn.RestMutateResponse;
