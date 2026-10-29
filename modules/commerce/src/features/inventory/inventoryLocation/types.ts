import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Where stock is held. Only `internal` locations hold company-owned stock; the rest are the
 * counterparties and virtual locations that give a movement its opposite side. See BR §4.2.
 */
export type InventoryLocationType =
	'internal' | 'group' | 'customer' | 'vendor' | 'inventory_loss' | 'production' | 'scrap' | 'transit';

export type InventoryLocationRemovalStrategy =
	'fifo' | 'lifo' | 'fefo' | 'closest' | 'least_packages';

/**
 * Operational state, separate from `is_archived`. A location may be suspended while it still holds
 * stock — locking a damaged rack is the point — but may not be archived while it does.
 */
export type InventoryLocationStatus = 'active' | 'suspended';

export type InventoryLocation = {
	id: string,
	name?: string,
	/** The full path through the location tree, derived by the backend; the record label. */
	canonical_name?: string,
	location_type?: InventoryLocationType,
	/**
	 * Inherited from the parent location by the backend. Null when the location belongs to no
	 * warehouse, which is normal for the external ones.
	 */
	warehouse_id?: string,
	parent_location_id?: string,
	hierarchy_depth?: number,
	barcode?: string,
	storage_category_id?: string,
	removal_strategy?: InventoryLocationRemovalStrategy,
	is_replenishment_destination?: boolean,
	is_system_generated?: boolean,
	status?: InventoryLocationStatus,
	description?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateInventoryLocationRequest = Record<string, any>;
export type CreateInventoryLocationResponse = dyn.RestCreateResponse;

export type DeleteInventoryLocationRequest = dyn.RestDeleteRequest;
export type DeleteInventoryLocationResponse = dyn.RestDeleteResponse;

export type GetInventoryLocationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetInventoryLocationByIdRequest = dyn.RestGetByIdRequest;
export type GetInventoryLocationResponse = dyn.RestGetOneResponse<InventoryLocation>;

export type InventoryLocationExistsRequest = dyn.RestExistsRequest;
export type InventoryLocationExistsResponse = dyn.RestExistsResponse;

export type SearchInventoryLocationsRequest = dyn.RestSearchRequest;
export type SearchInventoryLocationsResponse = dyn.RestSearchResponse<InventoryLocation>;

export type UpdateInventoryLocationRequest = dyn.RestUpdateRequest;
export type UpdateInventoryLocationResponse = dyn.RestMutateResponse;
