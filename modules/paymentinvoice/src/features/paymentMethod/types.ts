import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A way of paying that this deployment offers, and the gateway adapter that serves it.
 *
 * Withdrawing a method is `is_active: false` rather than a deletion: the orders that named it are
 * the financial record, and deleting the method would orphan them.
 */
export type PaymentMethod = {
	id: string,
	code?: string,

	/** Names the gateway adapter serving this method: `momo`, `mpos`, `vietqr`. */
	adapter_code?: string,

	name?: dyn.ModelSchemaLangJson,
	description?: dyn.ModelSchemaLangJson,
	currency_id?: string,

	/** Per-method bounds on what may be collected, as decimal strings. */
	min_amount?: string,
	max_amount?: string,

	is_active?: boolean,

	/** The method's own non-secret settings. Credentials never live here — they come from the
	 * deployment's configuration. */
	config?: Record<string, any>,

	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreatePaymentMethodRequest = Record<string, any>;
export type CreatePaymentMethodResponse = dyn.RestCreateResponse;

export type DeletePaymentMethodRequest = dyn.RestDeleteRequest;
export type DeletePaymentMethodResponse = dyn.RestDeleteResponse;

export type GetPaymentMethodSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetPaymentMethodByIdRequest = dyn.RestGetByIdRequest;
export type GetPaymentMethodResponse = dyn.RestGetOneResponse<PaymentMethod>;

export type PaymentMethodExistsRequest = dyn.RestExistsRequest;
export type PaymentMethodExistsResponse = dyn.RestExistsResponse;

export type SearchPaymentMethodsRequest = dyn.RestSearchRequest;
export type SearchPaymentMethodsResponse = dyn.RestSearchResponse<PaymentMethod>;

export type UpdatePaymentMethodRequest = dyn.RestUpdateRequest;
export type UpdatePaymentMethodResponse = dyn.RestMutateResponse;
