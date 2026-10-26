import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A declared resupply route. It states which warehouse may restock which and nothing more:
 * no stock is reserved and no transfer is created until the Stock movement engine makes one.
 *
 * Independent of the warehouse hierarchy: `parent_warehouse_id` says which warehouse system a
 * site belongs to, while this says who is allowed to restock it. They are usually the same
 * warehouse and need not be.
 */
export type SupplyRelation = {
	id: string,
	source_warehouse_id?: string,
	destination_warehouse_id?: string,
	/** Lower is considered first when a destination has several sources. */
	priority?: number,
	/** At most one unarchived relation per destination may set this. */
	is_default?: boolean,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type SearchSupplyRelationsResponse = dyn.RestSearchResponse<SupplyRelation>;
export type GetSupplyRelationResponse = dyn.RestGetOneResponse<SupplyRelation>;
