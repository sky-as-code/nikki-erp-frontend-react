import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only: what Confirm committed for one promotion on one order. Written by Confirm and reversed by Cancel,
 * never by a client.
 */
export type SalesPromotionApplication = {
	id: string,
	order_id?: string,
	promotion_id?: string,
	reward_id?: string,
	voucher_id?: string,
	status?: string,
	confirmation_revision?: string,
	config_version?: string,
	qualification_snapshot?: string,
	reward_snapshot?: string,
	discount_untaxed_amount?: string,
	tax_reduction_amount?: string,
	discount_total_amount?: string,
	applied_at?: string,
	reversed_at?: string,
	reversal_reason?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionApplicationRequest = Record<string, any>;
export type CreateSalesPromotionApplicationResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionApplicationRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionApplicationResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionApplicationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionApplicationByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionApplicationResponse = dyn.RestGetOneResponse<SalesPromotionApplication>;

export type SearchSalesPromotionApplicationsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionApplicationsResponse = dyn.RestSearchResponse<SalesPromotionApplication>;

export type UpdateSalesPromotionApplicationRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionApplicationResponse = dyn.RestMutateResponse;
