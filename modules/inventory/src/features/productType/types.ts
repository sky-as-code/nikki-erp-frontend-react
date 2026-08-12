import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * What a product type decides is which business processes a product participates in — whether it
 * is stocked, sold, purchased, manufactured. See BR §3.
 */
export type ProductType = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	description?: dyn.ModelSchemaLangJson,
	supports_stock?: boolean,
	supports_sale?: boolean,
	supports_purchase?: boolean,
	supports_manufacturing?: boolean,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductTypeRequest = Record<string, any>;
export type CreateProductTypeResponse = dyn.RestCreateResponse;

export type DeleteProductTypeRequest = dyn.RestDeleteRequest;
export type DeleteProductTypeResponse = dyn.RestDeleteResponse;

export type GetProductTypeSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductTypeByIdRequest = dyn.RestGetByIdRequest;
export type GetProductTypeResponse = dyn.RestGetOneResponse<ProductType>;

export type ProductTypeExistsRequest = dyn.RestExistsRequest;
export type ProductTypeExistsResponse = dyn.RestExistsResponse;

export type SearchProductTypesRequest = dyn.RestSearchRequest;
export type SearchProductTypesResponse = dyn.RestSearchResponse<ProductType>;

export type UpdateProductTypeRequest = dyn.RestUpdateRequest;
export type UpdateProductTypeResponse = dyn.RestMutateResponse;
