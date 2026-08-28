import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesPromotionReward = {
	id: string,
	sales_promotion_program_id?: string,
	sequence?: string,
	reward_type?: string,
	value?: string,
	target_scope?: string,
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

export type SalesPromotionRewardExistsRequest = dyn.RestExistsRequest;
export type SalesPromotionRewardExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPromotionRewardsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRewardsResponse = dyn.RestSearchResponse<SalesPromotionReward>;

export type UpdateSalesPromotionRewardRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRewardResponse = dyn.RestMutateResponse;
