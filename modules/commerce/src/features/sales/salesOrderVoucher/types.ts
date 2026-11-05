import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only: a code attached to a draft order, one per promotion. Written by `apply_voucher` / `remove_voucher`.
 */
export type SalesOrderVoucher = {
	id: string,
	order_id?: string,
	voucher_id?: string,
	promotion_id?: string,
	attached_at?: string,
	attached_by?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderVoucherRequest = Record<string, any>;
export type CreateSalesOrderVoucherResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderVoucherRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderVoucherResponse = dyn.RestDeleteResponse;

export type GetSalesOrderVoucherSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderVoucherByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderVoucherResponse = dyn.RestGetOneResponse<SalesOrderVoucher>;

export type SearchSalesOrderVouchersRequest = dyn.RestSearchRequest;
export type SearchSalesOrderVouchersResponse = dyn.RestSearchResponse<SalesOrderVoucher>;

export type UpdateSalesOrderVoucherRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderVoucherResponse = dyn.RestMutateResponse;
