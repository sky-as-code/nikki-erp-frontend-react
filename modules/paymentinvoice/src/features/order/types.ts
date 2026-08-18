import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A payment order: one attempt to collect money, and the record of what became of it.
 *
 * The money fields are strings rather than numbers because the backend stores them as decimals and
 * serialises them as strings — reading them as numbers would round the ones a float64 cannot hold.
 */
export type Order = {
	id: string,

	/** The identifier quoted to the ordering system: `[service:4][method:3][code:12]`. */
	order_id?: string,

	/** The 12-character code the gateway knows the order by. Not the same as `order_id`. */
	order_code?: string,

	source?: string,
	status?: string,
	amount?: string,
	refund_amount?: string,
	currency_id?: string,
	payment_method_id?: string,
	content?: string,
	return_url?: string,

	/** Outcome of the last attempt to notify the ordering system: `success` or `failure`. */
	last_sync_status?: string,

	/** The record of those attempts, under an `entries` key. */
	sync_logs?: Record<string, any>,

	/** Whatever the paying method needed at order time. Each adapter owns its own keys. */
	metadata?: Record<string, any>,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateOrderRequest = Record<string, any>;
export type CreateOrderResponse = dyn.RestCreateResponse;

export type DeleteOrderRequest = dyn.RestDeleteRequest;
export type DeleteOrderResponse = dyn.RestDeleteResponse;

export type GetOrderSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetOrderByIdRequest = dyn.RestGetByIdRequest;
export type GetOrderResponse = dyn.RestGetOneResponse<Order>;

export type OrderExistsRequest = dyn.RestExistsRequest;
export type OrderExistsResponse = dyn.RestExistsResponse;

export type SearchOrdersRequest = dyn.RestSearchRequest;
export type SearchOrdersResponse = dyn.RestSearchResponse<Order>;

export type UpdateOrderRequest = dyn.RestUpdateRequest;
export type UpdateOrderResponse = dyn.RestMutateResponse;
