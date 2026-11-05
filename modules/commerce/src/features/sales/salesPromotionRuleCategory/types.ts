import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A category a rule counts, descendants included. Written through the rule's `manage_categories`.
 */
export type SalesPromotionRuleCategory = {
	id: string,
	rule_id?: string,
	category_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRuleCategoryRequest = Record<string, any>;
export type CreateSalesPromotionRuleCategoryResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRuleCategoryRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionRuleCategoryResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionRuleCategorySchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionRuleCategoryByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionRuleCategoryResponse = dyn.RestGetOneResponse<SalesPromotionRuleCategory>;

export type SearchSalesPromotionRuleCategorysRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRuleCategorysResponse = dyn.RestSearchResponse<SalesPromotionRuleCategory>;

export type UpdateSalesPromotionRuleCategoryRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRuleCategoryResponse = dyn.RestMutateResponse;
