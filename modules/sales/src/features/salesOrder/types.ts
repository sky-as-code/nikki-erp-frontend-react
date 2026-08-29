import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Money fields are strings, not numbers: the backend stores decimals and serialises them as strings,
 * and parsing them as numbers rounds values a float64 cannot hold.
 *
 * The status fields are `no_update` — only the order's actions move them — and `subtotal` through
 * `grand_total` are computed from the lines and the adjustment chain.
 */
export type SalesOrder = {
	id: string,

	/** Allocated by the backend on create. Fiscal systems read this sequence. */
	order_number?: string,

	/** Derived from the sales point at creation, so a till cannot claim a sale happened elsewhere. */
	sales_channel_id?: string,
	sales_point_id?: string,

	/** Nullable: an anonymous sale is ordinary retail, not a missing customer. */
	customer_reference?: string,
	crm_opportunity_reference?: string,

	currency_code?: string,

	status?: string,
	payment_status?: string,
	fulfillment_status?: string,
	invoice_status?: string,

	/** Computed by the backend from the lines and adjustments. Read-only here. */
	subtotal?: string,
	discount_total?: string,
	tax_total?: string,
	grand_total?: string,

	/** Set when this sale replaces returned goods — an exchange is a return plus a new sale. */
	exchange_of_return_id?: string,

	external_reference?: string,

	/** What makes a retried create return the original order rather than a second one. */
	idempotency_key?: string,

	confirmed_at?: string,
	completed_at?: string,
	cancelled_at?: string,

	/**
	 * How the tax was determined. Sales stores it because Accounting keeps no copy, and a partial
	 * return later needs it verbatim.
	 */
	tax_snapshot?: Record<string, unknown>,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderRequest = Record<string, any>;
export type CreateSalesOrderResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderResponse = dyn.RestDeleteResponse;

export type GetSalesOrderSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderResponse = dyn.RestGetOneResponse<SalesOrder>;

export type SalesOrderExistsRequest = dyn.RestExistsRequest;
export type SalesOrderExistsResponse = dyn.RestExistsResponse;

export type SearchSalesOrdersRequest = dyn.RestSearchRequest;
export type SearchSalesOrdersResponse = dyn.RestSearchResponse<SalesOrder>;

export type UpdateSalesOrderRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderResponse = dyn.RestMutateResponse;
