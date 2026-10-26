import * as dyn from '@nikkierp/common/dynamicModel';


/** Whether goods arriving may be mixed into a location that already holds something. */
export type AllowNewItemPolicy = 'allow' | 'same_product_only' | 'empty_only';

export type StorageCategory = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	/** Null means unlimited. What is currently stored lives in Stock, never here. */
	max_weight?: string,
	allow_new_item_policy?: AllowNewItemPolicy,
	description?: dyn.ModelSchemaLangJson,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type SearchStorageCategoriesResponse = dyn.RestSearchResponse<StorageCategory>;
export type GetStorageCategoryResponse = dyn.RestGetOneResponse<StorageCategory>;
