import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only over HTTP: a client able to POST one could tell Inventory to move goods no sale asked
 * for. `accepted` is not `completed` — only a completed request counts toward fulfilled quantity,
 * and money taken with goods not dispensed lives exactly between the two.
 */
export type SalesFulfillmentRequest = {
	id: string,
	sales_order_id?: string,
	request_type?: string,
	status?: string,
	inventory_reference?: string,
	failure_reason?: string,
	requested_at?: string,
	completed_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesFulfillmentRequestRequest = Record<string, any>;
export type CreateSalesFulfillmentRequestResponse = dyn.RestCreateResponse;

export type DeleteSalesFulfillmentRequestRequest = dyn.RestDeleteRequest;
export type DeleteSalesFulfillmentRequestResponse = dyn.RestDeleteResponse;

export type GetSalesFulfillmentRequestSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesFulfillmentRequestByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesFulfillmentRequestResponse = dyn.RestGetOneResponse<SalesFulfillmentRequest>;

export type SalesFulfillmentRequestExistsRequest = dyn.RestExistsRequest;
export type SalesFulfillmentRequestExistsResponse = dyn.RestExistsResponse;

export type SearchSalesFulfillmentRequestsRequest = dyn.RestSearchRequest;
export type SearchSalesFulfillmentRequestsResponse = dyn.RestSearchResponse<SalesFulfillmentRequest>;

export type UpdateSalesFulfillmentRequestRequest = dyn.RestUpdateRequest;
export type UpdateSalesFulfillmentRequestResponse = dyn.RestMutateResponse;
