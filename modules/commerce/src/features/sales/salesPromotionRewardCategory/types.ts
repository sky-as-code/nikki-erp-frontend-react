import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A category a `specific_products` discount reaches. Written through the reward's `manage_categories`.
 */
export type SalesPromotionRewardCategory = {
	id: string,
	reward_id?: string,
	category_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRewardCategoryRequest = Record<string, any>;
export type CreateSalesPromotionRewardCategoryResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRewardCategoryRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionRewardCategoryResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionRewardCategorySchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionRewardCategoryByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionRewardCategoryResponse = dyn.RestGetOneResponse<SalesPromotionRewardCategory>;

export type SearchSalesPromotionRewardCategorysRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRewardCategorysResponse = dyn.RestSearchResponse<SalesPromotionRewardCategory>;

export type UpdateSalesPromotionRewardCategoryRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRewardCategoryResponse = dyn.RestMutateResponse;
