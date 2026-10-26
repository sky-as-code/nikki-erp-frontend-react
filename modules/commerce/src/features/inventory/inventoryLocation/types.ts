import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Where stock is held. Only `internal` locations hold company-owned stock; the rest are the
 * counterparties and virtual locations that give a movement its opposite side. See BR §4.2.
 */
export type InventoryLocationUsage =
	'internal' | 'customer' | 'vendor' | 'inventory_loss' | 'scrap' | 'transit' | 'virtual';

/** What a location is used for inside its warehouse. Null for a location outside any warehouse. */
export type InventoryLocationPurpose =
	'storage' | 'receiving' | 'quality' | 'picking' | 'packing' | 'output' | 'other';

export type InventoryLocationRemovalStrategy =
	'fifo' | 'lifo' | 'fefo' | 'closest' | 'least_packages';

/**
 * Operational state, separate from `is_archived`. A location may be suspended while it still holds
 * stock — locking a damaged rack is the point — but may not be archived while it does.
 */
export type InventoryLocationStatus = 'active' | 'suspended';

export type InventoryLocation = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	location_usage?: InventoryLocationUsage,
	purpose?: InventoryLocationPurpose,
	/** Null when the location belongs to no warehouse, which is normal for the external ones. */
	warehouse_id?: string,
	parent_location_id?: string,
	/** Derived from the tree by the backend; never edited directly. */
	complete_path?: string,
	hierarchy_depth?: number,
	barcode?: string,
	storage_category_id?: string,
	removal_strategy?: InventoryLocationRemovalStrategy,
	is_replenishment_destination?: boolean,
	is_system_generated?: boolean,
	status?: InventoryLocationStatus,
	description?: dyn.ModelSchemaLangJson,
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
