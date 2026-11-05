import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only: the draft reward choice or decline, persisted so it survives a reload. Written by
 * `select_promotion_reward`.
 */
export type SalesOrderPromotionSelection = {
	id: string,
	order_id?: string,
	promotion_id?: string,
	reward_id?: string,
	decision?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderPromotionSelectionRequest = Record<string, any>;
export type CreateSalesOrderPromotionSelectionResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderPromotionSelectionRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderPromotionSelectionResponse = dyn.RestDeleteResponse;

export type GetSalesOrderPromotionSelectionSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderPromotionSelectionByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderPromotionSelectionResponse = dyn.RestGetOneResponse<SalesOrderPromotionSelection>;

export type SearchSalesOrderPromotionSelectionsRequest = dyn.RestSearchRequest;
export type SearchSalesOrderPromotionSelectionsResponse = dyn.RestSearchResponse<SalesOrderPromotionSelection>;

export type UpdateSalesOrderPromotionSelectionRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderPromotionSelectionResponse = dyn.RestMutateResponse;
