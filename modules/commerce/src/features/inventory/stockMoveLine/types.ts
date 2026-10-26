import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The execution detail of a move: the exact quantity taken from an exact balance.
 *
 * It has no status of its own — it is a reservation until `operation_at` is stamped, and a
 * recorded movement afterwards. Keeping this apart from the move is what lets "how much was
 * needed" and "what was actually taken, from where" stay distinguishable (BR §4.2.5.2).
 *
 * Read-only in this phase: lines are written by the reservation engine, and editing an allocation
 * by hand would need the release-and-re-reserve flow of BR §4.2.5.4.
 */
export type StockMoveLine = {
	id: string,
	move_id?: string,
	transfer_id?: string,
	product_variant_id?: string,
	uom_id?: string,
	quantity?: string,
	base_quantity?: string,
	source_location_id?: string,
	destination_location_id?: string,
	/** Empty string means "not tracked by lot", never null — it identifies the balance drawn from. */
	lot_ref?: string,
	package_ref?: string,
	result_package_ref?: string,
	owner_ref?: string,
	picked?: boolean,
	operation_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type GetStockMoveLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetStockMoveLineByIdRequest = dyn.RestGetByIdRequest;
export type GetStockMoveLineResponse = dyn.RestGetOneResponse<StockMoveLine>;

export type StockMoveLineExistsRequest = dyn.RestExistsRequest;
export type StockMoveLineExistsResponse = dyn.RestExistsResponse;

export type SearchStockMoveLinesRequest = dyn.RestSearchRequest;
export type SearchStockMoveLinesResponse = dyn.RestSearchResponse<StockMoveLine>;
