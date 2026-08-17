import * as dyn from '@nikkierp/common/dynamicModel';


/** What a warehouse is for organisationally. It carries no behaviour of its own. */
export type WarehouseRole = 'central' | 'sub' | 'pos' | 'other';

/**
 * How many stops goods make on the way in or out. Policy, not execution: changing it provisions
 * the locations the new shape needs and creates no movement.
 */
export type WarehouseFlow = 'one_step' | 'two_step' | 'three_step';

/**
 * Operational state, separate from `is_archived`. Suspended is a temporary, reversible close;
 * archiving is withdrawal from the working set. A warehouse is usable only when it is active and
 * unarchived.
 */
export type WarehouseStatus = 'active' | 'suspended';

export type Warehouse = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	warehouse_role?: WarehouseRole,
	/** Organisational only. Stock at the parent is not stock at the child. */
	parent_warehouse_id?: string,
	address?: string,
	manager_user_id?: string,
	incoming_flow?: WarehouseFlow,
	outgoing_flow?: WarehouseFlow,
	status?: WarehouseStatus,
	notes?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateWarehouseRequest = Record<string, any>;
export type CreateWarehouseResponse = dyn.RestCreateResponse;

export type DeleteWarehouseRequest = dyn.RestDeleteRequest;
export type DeleteWarehouseResponse = dyn.RestDeleteResponse;

export type GetWarehouseSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetWarehouseByIdRequest = dyn.RestGetByIdRequest;
export type GetWarehouseResponse = dyn.RestGetOneResponse<Warehouse>;

export type WarehouseExistsRequest = dyn.RestExistsRequest;
export type WarehouseExistsResponse = dyn.RestExistsResponse;

export type SearchWarehousesRequest = dyn.RestSearchRequest;
export type SearchWarehousesResponse = dyn.RestSearchResponse<Warehouse>;

export type UpdateWarehouseRequest = dyn.RestUpdateRequest;
export type UpdateWarehouseResponse = dyn.RestMutateResponse;
