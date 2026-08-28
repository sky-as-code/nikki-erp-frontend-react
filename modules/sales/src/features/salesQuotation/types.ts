import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Separate from an order because a quotation that never converts would leave a hole in the order
 * sequence, which fiscal systems read. `status` is `no_update`: send, cancel and convert are the
 * only ways it moves.
 */
export type SalesQuotation = {
	id: string,
	quotation_number?: string,
	sales_channel_id?: string,
	sales_point_id?: string,
	customer_reference?: string,
	currency_code?: string,
	status?: string,
	valid_until?: string,
	subtotal?: string,
	discount_total?: string,
	tax_total?: string,
	grand_total?: string,
	converted_sales_order_id?: string,
	sent_at?: string,
	accepted_at?: string,
	cancelled_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesQuotationRequest = Record<string, any>;
export type CreateSalesQuotationResponse = dyn.RestCreateResponse;

export type DeleteSalesQuotationRequest = dyn.RestDeleteRequest;
export type DeleteSalesQuotationResponse = dyn.RestDeleteResponse;

export type GetSalesQuotationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesQuotationByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesQuotationResponse = dyn.RestGetOneResponse<SalesQuotation>;

export type SalesQuotationExistsRequest = dyn.RestExistsRequest;
export type SalesQuotationExistsResponse = dyn.RestExistsResponse;

export type SearchSalesQuotationsRequest = dyn.RestSearchRequest;
export type SearchSalesQuotationsResponse = dyn.RestSearchResponse<SalesQuotation>;

export type UpdateSalesQuotationRequest = dyn.RestUpdateRequest;
export type UpdateSalesQuotationResponse = dyn.RestMutateResponse;
