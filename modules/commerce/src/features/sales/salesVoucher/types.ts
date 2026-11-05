import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A code that unlocks a promotion. Create ignores `source_order_id`, `voucher_type` and `used_count`: next-order
 * coupons are issued only by a confirmed source order. `availability` is computed by the server.
 */
export type SalesVoucher = {
	id: string,
	promotion_id?: string,
	code?: string,
	normalized_code?: string,
	voucher_type?: string,
	status?: string,
	customer_id?: string,
	valid_from?: string,
	expires_at?: string,
	usage_limit?: string,
	used_count?: string,
	source_order_id?: string,
	issued_at?: string,
	revoked_at?: string,
	revoked_by?: string,
	revocation_reason?: string,
	revocation_note?: string,
	availability?: string,
	is_archived?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesVoucherRequest = Record<string, any>;
export type CreateSalesVoucherResponse = dyn.RestCreateResponse;

export type DeleteSalesVoucherRequest = dyn.RestDeleteRequest;
export type DeleteSalesVoucherResponse = dyn.RestDeleteResponse;

export type GetSalesVoucherSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesVoucherByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesVoucherResponse = dyn.RestGetOneResponse<SalesVoucher>;

export type SearchSalesVouchersRequest = dyn.RestSearchRequest;
export type SearchSalesVouchersResponse = dyn.RestSearchResponse<SalesVoucher>;

export type UpdateSalesVoucherRequest = dyn.RestUpdateRequest;
export type UpdateSalesVoucherResponse = dyn.RestMutateResponse;
