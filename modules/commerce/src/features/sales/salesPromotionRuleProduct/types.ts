import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A product a rule counts: a template (every variant) or one variant, never both. Written through the rule's
 * `manage_products`, which asserts `update` on the promotion.
 */
export type SalesPromotionRuleProduct = {
	id: string,
	rule_id?: string,
	product_template_id?: string,
	product_variant_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRuleProductRequest = Record<string, any>;
export type CreateSalesPromotionRuleProductResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRuleProductRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionRuleProductResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionRuleProductSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionRuleProductByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionRuleProductResponse = dyn.RestGetOneResponse<SalesPromotionRuleProduct>;

export type SearchSalesPromotionRuleProductsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionRuleProductsResponse = dyn.RestSearchResponse<SalesPromotionRuleProduct>;

export type UpdateSalesPromotionRuleProductRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionRuleProductResponse = dyn.RestMutateResponse;
