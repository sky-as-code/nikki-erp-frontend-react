import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesPricelistItem = {
	id: string,
	sales_pricelist_id?: string,
	product_variant_id?: string,
	uom_id?: string,
	price?: string,
	min_quantity?: string,
	applies_to?: string,
	product_template_id?: string,
	product_category_id?: string,
	valid_from?: string,
	valid_to?: string,
	sequence?: string,
	calculation_method?: string,
	discount_percent?: string,
	base_price_source?: string,
	base_pricelist_id?: string,
	surcharge_amount?: string,
	rounding_increment?: string,
	minimum_margin?: string,
	maximum_margin?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPricelistItemRequest = Record<string, any>;
export type CreateSalesPricelistItemResponse = dyn.RestCreateResponse;

export type DeleteSalesPricelistItemRequest = dyn.RestDeleteRequest;
export type DeleteSalesPricelistItemResponse = dyn.RestDeleteResponse;

export type GetSalesPricelistItemSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPricelistItemByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPricelistItemResponse = dyn.RestGetOneResponse<SalesPricelistItem>;

export type SalesPricelistItemExistsRequest = dyn.RestExistsRequest;
export type SalesPricelistItemExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPricelistItemsRequest = dyn.RestSearchRequest;
export type SearchSalesPricelistItemsResponse = dyn.RestSearchResponse<SalesPricelistItem>;

export type UpdateSalesPricelistItemRequest = dyn.RestUpdateRequest;
export type UpdateSalesPricelistItemResponse = dyn.RestMutateResponse;
