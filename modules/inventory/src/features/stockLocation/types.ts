import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Where stock is held. Only `internal` locations hold company-owned stock; the rest are the
 * counterparties and virtual locations that give a movement its opposite side. See BR §4.2.
 */
export type StockLocationType =
	'internal' | 'customer' | 'supplier' | 'inventory_loss' | 'scrap' | 'transit';

export type StockLocation = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	location_type?: StockLocationType,
	parent_location_id?: string,
	description?: dyn.ModelSchemaLangJson,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateStockLocationRequest = Record<string, any>;
export type CreateStockLocationResponse = dyn.RestCreateResponse;

export type DeleteStockLocationRequest = dyn.RestDeleteRequest;
export type DeleteStockLocationResponse = dyn.RestDeleteResponse;

export type GetStockLocationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetStockLocationByIdRequest = dyn.RestGetByIdRequest;
export type GetStockLocationResponse = dyn.RestGetOneResponse<StockLocation>;

export type StockLocationExistsRequest = dyn.RestExistsRequest;
export type StockLocationExistsResponse = dyn.RestExistsResponse;

export type SearchStockLocationsRequest = dyn.RestSearchRequest;
export type SearchStockLocationsResponse = dyn.RestSearchResponse<StockLocation>;

export type UpdateStockLocationRequest = dyn.RestUpdateRequest;
export type UpdateStockLocationResponse = dyn.RestMutateResponse;
