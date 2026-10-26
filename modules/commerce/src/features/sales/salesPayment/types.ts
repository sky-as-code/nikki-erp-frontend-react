import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only over HTTP: a payment is recorded through the bill's `pay` action, which applies gates a
 * plain POST would bypass, among them that the method is both mapped to the channel and usable in
 * the running build. Only a `captured` payment counts toward settlement, since an authorization is
 * a hold the provider may still release.
 */
export type SalesPayment = {
	id: string,
	sales_bill_id?: string,
	payment_method_id?: string,
	payment_method_code_snapshot?: string,
	amount?: string,
	currency_code?: string,
	status?: string,
	external_transaction_id?: string,
	provider_reference?: string,
	paid_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPaymentRequest = Record<string, any>;
export type CreateSalesPaymentResponse = dyn.RestCreateResponse;

export type DeleteSalesPaymentRequest = dyn.RestDeleteRequest;
export type DeleteSalesPaymentResponse = dyn.RestDeleteResponse;

export type GetSalesPaymentSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPaymentByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPaymentResponse = dyn.RestGetOneResponse<SalesPayment>;

export type SalesPaymentExistsRequest = dyn.RestExistsRequest;
export type SalesPaymentExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPaymentsRequest = dyn.RestSearchRequest;
export type SearchSalesPaymentsResponse = dyn.RestSearchResponse<SalesPayment>;

export type UpdateSalesPaymentRequest = dyn.RestUpdateRequest;
export type UpdateSalesPaymentResponse = dyn.RestMutateResponse;
