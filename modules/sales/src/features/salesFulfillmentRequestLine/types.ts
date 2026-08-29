import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesFulfillmentRequestLine = {
	id: string,
	sales_fulfillment_request_id?: string,
	sales_order_line_id?: string,
	quantity?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesFulfillmentRequestLineRequest = Record<string, any>;
export type CreateSalesFulfillmentRequestLineResponse = dyn.RestCreateResponse;

export type DeleteSalesFulfillmentRequestLineRequest = dyn.RestDeleteRequest;
export type DeleteSalesFulfillmentRequestLineResponse = dyn.RestDeleteResponse;

export type GetSalesFulfillmentRequestLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesFulfillmentRequestLineByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesFulfillmentRequestLineResponse = dyn.RestGetOneResponse<SalesFulfillmentRequestLine>;

export type SalesFulfillmentRequestLineExistsRequest = dyn.RestExistsRequest;
export type SalesFulfillmentRequestLineExistsResponse = dyn.RestExistsResponse;

export type SearchSalesFulfillmentRequestLinesRequest = dyn.RestSearchRequest;
export type SearchSalesFulfillmentRequestLinesResponse = dyn.RestSearchResponse<SalesFulfillmentRequestLine>;

export type UpdateSalesFulfillmentRequestLineRequest = dyn.RestUpdateRequest;
export type UpdateSalesFulfillmentRequestLineResponse = dyn.RestMutateResponse;
