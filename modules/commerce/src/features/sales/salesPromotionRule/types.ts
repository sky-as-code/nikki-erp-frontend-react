import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A qualification threshold. `phase=apply` rules decide whether the promotion applies, `phase=issue` ones whether
 * a next-order coupon is issued. `has_mixed_uom` warns that the selected products count in different UoM categories.
 */
export type SalesPromotionRule = {
	id: string,
	promotion_id?: string,
	phase?: string,
	name?: string,
	min_quantity?: string,
	qualification_uom_id?: string,
	min_amount?: string,
	amount_tax_basis?: string,
	has_mixed_uom?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRuleRequest = Record<string, any>;
export type CreateSalesPromotionRuleResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRuleRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionRuleResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionRuleSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionRuleByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionRuleResponse = dyn.RestGetOneResponse<SalesPromotionRule>;

export type SearchSalesPromotionRulesRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRulesResponse = dyn.RestSearchResponse<SalesPromotionRule>;

export type UpdateSalesPromotionRuleRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRuleResponse = dyn.RestMutateResponse;
