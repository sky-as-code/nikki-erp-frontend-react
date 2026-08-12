import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Product categories form a hierarchy: `parent_category_id` points at the category above, and a
 * category may not become its own ancestor. See BR §5 and the `product_category.cycle` rule.
 */
export type ProductCategory = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	description?: dyn.ModelSchemaLangJson,
	parent_category_id?: string,
	sequence?: number,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductCategoryRequest = Record<string, any>;
export type CreateProductCategoryResponse = dyn.RestCreateResponse;

export type DeleteProductCategoryRequest = dyn.RestDeleteRequest;
export type DeleteProductCategoryResponse = dyn.RestDeleteResponse;

export type GetProductCategorySchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductCategoryByIdRequest = dyn.RestGetByIdRequest;
export type GetProductCategoryResponse = dyn.RestGetOneResponse<ProductCategory>;

export type ProductCategoryExistsRequest = dyn.RestExistsRequest;
export type ProductCategoryExistsResponse = dyn.RestExistsResponse;

export type SearchProductCategoriesRequest = dyn.RestSearchRequest;
export type SearchProductCategoriesResponse = dyn.RestSearchResponse<ProductCategory>;

export type UpdateProductCategoryRequest = dyn.RestUpdateRequest;
export type UpdateProductCategoryResponse = dyn.RestMutateResponse;
