import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * What a qualifying order receives. `free_shipping` is declared but never applies: Sales has no shipping line.
 */
export type SalesPromotionReward = {
	id: string,
	promotion_id?: string,
	reward_type?: string,
	order_description?: string,
	discount_method?: string,
	discount_value?: string,
	discount_scope?: string,
	max_discount_amount?: string,
	gift_product_variant_id?: string,
	gift_quantity?: string,
	gift_uom_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRewardRequest = Record<string, any>;
export type CreateSalesPromotionRewardResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRewardRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionRewardResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionRewardSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionRewardByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionRewardResponse = dyn.RestGetOneResponse<SalesPromotionReward>;

export type SearchSalesPromotionRewardsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRewardsResponse = dyn.RestSearchResponse<SalesPromotionReward>;

export type UpdateSalesPromotionRewardRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRewardResponse = dyn.RestMutateResponse;
