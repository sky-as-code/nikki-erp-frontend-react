import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A declared resupply route. It states which warehouse may restock which and nothing more:
 * no stock is reserved and no transfer is created until the Stock movement engine makes one.
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
