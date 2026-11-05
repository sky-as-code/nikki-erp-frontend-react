import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A product a `specific_products` discount reaches: a template or one variant, never both. Written through the
 * reward's `manage_products`.
 */
export type SalesPromotionRewardProduct = {
	id: string,
	reward_id?: string,
	product_template_id?: string,
	product_variant_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRewardProductRequest = Record<string, any>;
export type CreateSalesPromotionRewardProductResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRewardProductRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionRewardProductResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionRewardProductSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionRewardProductByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionRewardProductResponse = dyn.RestGetOneResponse<SalesPromotionRewardProduct>;

export type SearchSalesPromotionRewardProductsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRewardProductsResponse = dyn.RestSearchResponse<SalesPromotionRewardProduct>;

export type UpdateSalesPromotionRewardProductRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRewardProductResponse = dyn.RestMutateResponse;
