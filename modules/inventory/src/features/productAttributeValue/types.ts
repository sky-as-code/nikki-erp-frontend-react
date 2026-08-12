import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One allowed value of an attribute — "Red", "XL". These are the global values; a template
 * references them through `inventory_product_template_attribute_value`, and it is that
 * template-scoped id a variant's combination key carries. See BR §6.7.
 */
export type ProductAttributeValue = {
	id: string,
	attribute_id?: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	/** Added to the template's price when this value is chosen. A decimal, carried as a string. */
	price_extra?: string,
	sequence?: number,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductAttributeValueRequest = Record<string, any>;
export type CreateProductAttributeValueResponse = dyn.RestCreateResponse;

export type DeleteProductAttributeValueRequest = dyn.RestDeleteRequest;
export type DeleteProductAttributeValueResponse = dyn.RestDeleteResponse;

export type GetProductAttributeValueSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductAttributeValueByIdRequest = dyn.RestGetByIdRequest;
export type GetProductAttributeValueResponse = dyn.RestGetOneResponse<ProductAttributeValue>;

export type ProductAttributeValueExistsRequest = dyn.RestExistsRequest;
export type ProductAttributeValueExistsResponse = dyn.RestExistsResponse;

export type SearchProductAttributeValuesRequest = dyn.RestSearchRequest;
export type SearchProductAttributeValuesResponse = dyn.RestSearchResponse<ProductAttributeValue>;

export type UpdateProductAttributeValueRequest = dyn.RestUpdateRequest;
export type UpdateProductAttributeValueResponse = dyn.RestMutateResponse;
