import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Lifecycle of a stock transfer. Derived by the backend from the states of its moves, never set
 * by a client: a status assigned by hand would claim an outcome no movement produced. See BR §6.1.
 */
export type StockTransferStatus =
	'draft' | 'waiting' | 'confirmed' | 'ready' | 'done' | 'cancelled';

/** The direction of the movements a transfer performs, snapshotted from its operation type. */
export type StockOperationCode = 'incoming' | 'outgoing' | 'internal';

export type StockReservationMethod = 'at_confirmation' | 'manual' | 'before_scheduled_date';
export type StockBackorderPolicy = 'ask' | 'always' | 'never';
export type StockShippingPolicy = 'partial' | 'all_at_once';

/**
 * The header of a stock transaction: what moves, between which locations, in what state.
 *
 * `operation_code`, `reservation_method`, `backorder_policy` and `shipping_policy` are snapshots
 * taken from the operation type when the transfer was created, not live references. Reconfiguring
 * the type afterwards must not reinterpret a transfer already created (BR §4.2.3.4).
 */
export type StockTransfer = {
	id: string,
	transfer_number?: string,
	operation_type_id?: string,
	operation_code?: StockOperationCode,
	origin_reference?: string,
	source_location_id?: string,
	destination_location_id?: string,
	status?: StockTransferStatus,
	priority?: number,
	reservation_method?: StockReservationMethod,
	backorder_policy?: StockBackorderPolicy,
	shipping_policy?: StockShippingPolicy,
	scheduled_at?: string,
	deadline_at?: string,
	completed_at?: string,
	/** The transfer this one carries the undelivered remainder of (STOCK-INV-010). */
	backorder_of_id?: string,
	return_of_id?: string,
	chain_group_id?: string,
	/** The key of the validate that completed this transfer, for retry detection (BR §8.7). */
	idempotency_key?: string,
	note?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateStockTransferRequest = Record<string, any>;
export type CreateStockTransferResponse = dyn.RestCreateResponse;

export type DeleteStockTransferRequest = dyn.RestDeleteRequest;
export type DeleteStockTransferResponse = dyn.RestDeleteResponse;

export type GetStockTransferSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetStockTransferByIdRequest = dyn.RestGetByIdRequest;
export type GetStockTransferResponse = dyn.RestGetOneResponse<StockTransfer>;

export type StockTransferExistsRequest = dyn.RestExistsRequest;
export type StockTransferExistsResponse = dyn.RestExistsResponse;

export type SearchStockTransfersRequest = dyn.RestSearchRequest;
export type SearchStockTransfersResponse = dyn.RestSearchResponse<StockTransfer>;
