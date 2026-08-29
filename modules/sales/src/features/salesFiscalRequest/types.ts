import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `provider_reference` is the only durable link to the issued document, which the provider owns.
 * Issuing can fail transiently, so a request left `pending` is a real state, not a failure.
 */
export type SalesFiscalRequest = {
	id: string,
	sales_bill_id?: string,
	intent?: string,
	status?: string,
	idempotency_key?: string,
	provider_reference?: string,
	attempt_count?: string,
	last_error?: string,
	buyer_snapshot?: Record<string, unknown>,
	original_fiscal_request_id?: string,
	requested_at?: string,
	issued_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesFiscalRequestRequest = Record<string, any>;
export type CreateSalesFiscalRequestResponse = dyn.RestCreateResponse;

export type GetSalesFiscalRequestSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesFiscalRequestByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesFiscalRequestResponse = dyn.RestGetOneResponse<SalesFiscalRequest>;

export type SalesFiscalRequestExistsRequest = dyn.RestExistsRequest;
export type SalesFiscalRequestExistsResponse = dyn.RestExistsResponse;

export type SearchSalesFiscalRequestsRequest = dyn.RestSearchRequest;
export type SearchSalesFiscalRequestsResponse = dyn.RestSearchResponse<SalesFiscalRequest>;
