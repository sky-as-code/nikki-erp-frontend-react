import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The current stock balance at one combination of dimensions: a variant, in a location, optionally
 * narrowed by lot, package and owner. See BR §4.2.2.
 *
 * Quantities are carried as strings, never parsed into a JavaScript number: the backend sends
 * decimals a float64 cannot hold exactly, and a balance is the running total of many movements, so
 * rounding drift would accumulate. See docs/wiki/04. Dynamic schema UI.md §4.
 */
export type StockQuant = {
	id: string,
	product_variant_id?: string,
	location_id?: string,
	/** Empty string means "not tracked by lot", never null — it is part of the balance's identity. */
	lot_ref?: string,
	package_ref?: string,
	owner_ref?: string,
	base_uom_id?: string,
	on_hand_quantity?: string,
	reserved_quantity?: string,
	/** Derived on the server as on-hand minus reserved; it has no column and cannot be written. */
	available_quantity?: string,
	incoming_date?: string,
	counted_quantity?: string,
	count_quantity_set?: boolean,
	count_snapshot_quantity?: string,
	count_reason_code?: string,
	count_reason_text?: string,
	next_count_date?: string,
	last_count_date?: string,
	count_assigned_user_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type GetStockQuantSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetStockQuantByIdRequest = dyn.RestGetByIdRequest;
export type GetStockQuantResponse = dyn.RestGetOneResponse<StockQuant>;

export type StockQuantExistsRequest = dyn.RestExistsRequest;
export type StockQuantExistsResponse = dyn.RestExistsResponse;

export type SearchStockQuantsRequest = dyn.RestSearchRequest;
export type SearchStockQuantsResponse = dyn.RestSearchResponse<StockQuant>;
