import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesPromotionConditionGroup = {
	id: string,
	sales_promotion_program_id?: string,
	sequence?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionConditionGroupRequest = Record<string, any>;
export type CreateSalesPromotionConditionGroupResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionConditionGroupRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionConditionGroupResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionConditionGroupSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionConditionGroupByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionConditionGroupResponse = dyn.RestGetOneResponse<SalesPromotionConditionGroup>;

export type SalesPromotionConditionGroupExistsRequest = dyn.RestExistsRequest;
export type SalesPromotionConditionGroupExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPromotionConditionGroupsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionConditionGroupsResponse = dyn.RestSearchResponse<SalesPromotionConditionGroup>;

export type UpdateSalesPromotionConditionGroupRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionConditionGroupResponse = dyn.RestMutateResponse;
