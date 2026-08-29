import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesVoucherRedemption = {
	id: string,
	voucher_code_id?: string,
	sales_order_id?: string,
	status?: string,
	reserved_at?: string,
	redeemed_at?: string,
	released_at?: string,
	reversed_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesVoucherRedemptionRequest = Record<string, any>;
export type CreateSalesVoucherRedemptionResponse = dyn.RestCreateResponse;

export type DeleteSalesVoucherRedemptionRequest = dyn.RestDeleteRequest;
export type DeleteSalesVoucherRedemptionResponse = dyn.RestDeleteResponse;

export type GetSalesVoucherRedemptionSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesVoucherRedemptionByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesVoucherRedemptionResponse = dyn.RestGetOneResponse<SalesVoucherRedemption>;

export type SalesVoucherRedemptionExistsRequest = dyn.RestExistsRequest;
export type SalesVoucherRedemptionExistsResponse = dyn.RestExistsResponse;

export type SearchSalesVoucherRedemptionsRequest = dyn.RestSearchRequest;
export type SearchSalesVoucherRedemptionsResponse = dyn.RestSearchResponse<SalesVoucherRedemption>;

export type UpdateSalesVoucherRedemptionRequest = dyn.RestUpdateRequest;
export type UpdateSalesVoucherRedemptionResponse = dyn.RestMutateResponse;
