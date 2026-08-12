import * as dyn from '@nikkierp/common/dynamicModel';


/** The direction of the movements a transfer of this type performs. See BR §4.2.1.2. */
export type StockOperationCode = 'incoming' | 'outgoing' | 'internal';

/** When stock is reserved for a transfer of this type. See BR §4.2.6.4. */
export type StockReservationMethod = 'at_confirmation' | 'manual' | 'before_scheduled_date';

/** What happens to the quantity a partially-processed transfer did not deliver. See BR §4.2.3.11. */
export type StockBackorderPolicy = 'ask' | 'always' | 'never';

export type StockOperationType = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	operation_code?: StockOperationCode,
	reservation_method?: StockReservationMethod,
	reserve_before_days?: number,
	backorder_policy?: StockBackorderPolicy,
	shipping_policy?: 'partial' | 'all_at_once',
	default_source_location_id?: string,
	default_destination_location_id?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateStockOperationTypeRequest = Record<string, any>;
export type CreateStockOperationTypeResponse = dyn.RestCreateResponse;

export type DeleteStockOperationTypeRequest = dyn.RestDeleteRequest;
export type DeleteStockOperationTypeResponse = dyn.RestDeleteResponse;

export type GetStockOperationTypeSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetStockOperationTypeByIdRequest = dyn.RestGetByIdRequest;
export type GetStockOperationTypeResponse = dyn.RestGetOneResponse<StockOperationType>;

export type StockOperationTypeExistsRequest = dyn.RestExistsRequest;
export type StockOperationTypeExistsResponse = dyn.RestExistsResponse;

export type SearchStockOperationTypesRequest = dyn.RestSearchRequest;
export type SearchStockOperationTypesResponse = dyn.RestSearchResponse<StockOperationType>;

export type UpdateStockOperationTypeRequest = dyn.RestUpdateRequest;
export type UpdateStockOperationTypeResponse = dyn.RestMutateResponse;
