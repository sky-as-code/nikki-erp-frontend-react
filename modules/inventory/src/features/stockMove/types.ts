import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Allocation state of a move. The two a transfer does not have — `partially_available` and
 * `assigned` — are the outcomes of reserving: a move knows how much of its demand is claimed,
 * where a transfer only knows whether all of its moves are ready. See BR §4.2.3.8.
 */
export type StockMoveStatus =
	'draft' | 'waiting' | 'confirmed' | 'partially_available' | 'assigned' | 'done' | 'cancelled';

/**
 * One line of demand within a transfer: this much of this variant, from here to there.
 *
 * `demand_quantity` records what was asked for and is never rewritten to what was delivered — a
 * partial validate leaves it intact and puts the remainder on a backorder (STOCK-INV-020).
 *
 * Quantities are carried as strings, never parsed into a JavaScript number: the backend sends
 * decimals a float64 cannot hold exactly. See docs/wiki/04. Dynamic schema UI.md §4.
 */
export type StockMove = {
	id: string,
	transfer_id?: string,
	sequence?: number,
	product_variant_id?: string,
	uom_id?: string,
	demand_quantity?: string,
	base_demand_quantity?: string,
	source_location_id?: string,
	destination_location_id?: string,
	final_location_id?: string,
	status?: StockMoveStatus,
	priority?: number,
	scheduled_at?: string,
	deadline_at?: string,
	reservation_date?: string,
	picked?: boolean,
	origin_move_id?: string,
	is_inventory_adjustment?: boolean,
	scrap_id?: string,
	/** Declared by the backend but left unwritten until the valuation phase. */
	valuation_value?: string,
	remaining_quantity?: string,
	remaining_value?: string,
	currency_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateStockMoveRequest = Record<string, any>;
export type CreateStockMoveResponse = dyn.RestCreateResponse;

export type DeleteStockMoveRequest = dyn.RestDeleteRequest;
export type DeleteStockMoveResponse = dyn.RestDeleteResponse;

export type GetStockMoveSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetStockMoveByIdRequest = dyn.RestGetByIdRequest;
export type GetStockMoveResponse = dyn.RestGetOneResponse<StockMove>;

export type StockMoveExistsRequest = dyn.RestExistsRequest;
export type StockMoveExistsResponse = dyn.RestExistsResponse;

export type SearchStockMovesRequest = dyn.RestSearchRequest;
export type SearchStockMovesResponse = dyn.RestSearchResponse<StockMove>;
