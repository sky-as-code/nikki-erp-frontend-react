import * as dyn from '@nikkierp/common/dynamicModel';


/** How a sublocation under the rule's destination is chosen. */
export type SublocationStrategy = 'fixed' | 'last_used' | 'category';

/**
 * Where goods arriving at one location should be put next. The rule answers the question and
 * changes nothing; moving the goods is the Stock movement engine's job.
 */
export type PutawayRule = {
	id: string,
	code?: string,
	warehouse_id?: string,
	source_location_id?: string,
	destination_location_id?: string,
	storage_category_id?: string,
	/** Optional external references. A criterion left empty matches anything. */
	product_id?: string,
	product_category_id?: string,
	package_type_id?: string,
	/** Lower is considered first; the first valid candidate wins. */
	priority?: number,
	sublocation_strategy?: SublocationStrategy,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type SearchPutawayRulesResponse = dyn.RestSearchResponse<PutawayRule>;
export type GetPutawayRuleResponse = dyn.RestGetOneResponse<PutawayRule>;
