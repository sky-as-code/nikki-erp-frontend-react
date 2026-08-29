import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `usage_count` is maintained by redemption, not written here: the limit is enforced by a
 * conditional update that fails once the count is reached, which is what makes a single-use code
 * single-use under concurrency.
 */
export type SalesVoucherCode = {
	id: string,
	code?: string,
	sales_promotion_program_id?: string,
	valid_from?: string,
	valid_until?: string,
	usage_limit?: string,
	usage_count?: string,
	status?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesVoucherCodeRequest = Record<string, any>;
export type CreateSalesVoucherCodeResponse = dyn.RestCreateResponse;

export type DeleteSalesVoucherCodeRequest = dyn.RestDeleteRequest;
export type DeleteSalesVoucherCodeResponse = dyn.RestDeleteResponse;

export type GetSalesVoucherCodeSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesVoucherCodeByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesVoucherCodeResponse = dyn.RestGetOneResponse<SalesVoucherCode>;

export type SalesVoucherCodeExistsRequest = dyn.RestExistsRequest;
export type SalesVoucherCodeExistsResponse = dyn.RestExistsResponse;

export type SearchSalesVoucherCodesRequest = dyn.RestSearchRequest;
export type SearchSalesVoucherCodesResponse = dyn.RestSearchResponse<SalesVoucherCode>;

export type UpdateSalesVoucherCodeRequest = dyn.RestUpdateRequest;
export type UpdateSalesVoucherCodeResponse = dyn.RestMutateResponse;
