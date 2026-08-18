import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One movement of money against an order: the payment attempt, or a refund filed against it.
 *
 * `ref_transaction_id` and `ref_payload` are the gateway's own record of the movement, kept
 * verbatim as the evidence someone reconciling a disputed payment compares against.
 */
export type Transaction = {
	id: string,

	/** This module's primary key for the order. */
	order_id?: string,

	/** The order's quoted identifier, denormalized so a transaction can be read on its own. */
	order_business_id?: string,

	status?: string,
	amount?: string,
	currency_id?: string,
	payment_method_id?: string,

	/** `payment` or `refund`. */
	transaction_type?: string,

	content?: string,

	/** The gateway's identifier for the movement — MoMo's transId, mPOS's transCode, VietQR's
	 * referenceNumber — which a later refund is filed against. */
	ref_transaction_id?: string,

	/** The gateway's own reply, kept as evidence. */
	ref_payload?: Record<string, any>,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateTransactionRequest = Record<string, any>;
export type CreateTransactionResponse = dyn.RestCreateResponse;

export type DeleteTransactionRequest = dyn.RestDeleteRequest;
export type DeleteTransactionResponse = dyn.RestDeleteResponse;

export type GetTransactionSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetTransactionByIdRequest = dyn.RestGetByIdRequest;
export type GetTransactionResponse = dyn.RestGetOneResponse<Transaction>;

export type TransactionExistsRequest = dyn.RestExistsRequest;
export type TransactionExistsResponse = dyn.RestExistsResponse;

export type SearchTransactionsRequest = dyn.RestSearchRequest;
export type SearchTransactionsResponse = dyn.RestSearchResponse<Transaction>;

export type UpdateTransactionRequest = dyn.RestUpdateRequest;
export type UpdateTransactionResponse = dyn.RestMutateResponse;
