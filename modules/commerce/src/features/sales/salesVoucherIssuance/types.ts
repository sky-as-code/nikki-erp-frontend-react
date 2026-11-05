import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only: a next-order coupon a confirmed order issued. One per order and promotion.
 */
export type SalesVoucherIssuance = {
	id: string,
	source_order_id?: string,
	promotion_id?: string,
	voucher_id?: string,
	issue_rule_snapshot?: string,
	issued_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesVoucherIssuanceRequest = Record<string, any>;
export type CreateSalesVoucherIssuanceResponse = dyn.RestCreateResponse;

export type DeleteSalesVoucherIssuanceRequest = dyn.RestDeleteRequest;
export type DeleteSalesVoucherIssuanceResponse = dyn.RestDeleteResponse;

export type GetSalesVoucherIssuanceSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesVoucherIssuanceByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesVoucherIssuanceResponse = dyn.RestGetOneResponse<SalesVoucherIssuance>;

export type SearchSalesVoucherIssuancesRequest = dyn.RestSearchRequest;
export type SearchSalesVoucherIssuancesResponse = dyn.RestSearchResponse<SalesVoucherIssuance>;

export type UpdateSalesVoucherIssuanceRequest = dyn.RestUpdateRequest;
export type UpdateSalesVoucherIssuanceResponse = dyn.RestMutateResponse;
