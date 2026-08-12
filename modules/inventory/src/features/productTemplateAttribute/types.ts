import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Attaches one attribute to a template. The values chosen for it live in
 * `inventory_product_template_attribute_value`, and it is those template-scoped value ids a
 * variant's combination key carries. See BR §6.7.
 */
export type ProductTemplateAttribute = {
	id: string,
	product_template_id?: string,
	attribute_id?: string,
	sequence?: number,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductTemplateAttributeRequest = Record<string, any>;
export type CreateProductTemplateAttributeResponse = dyn.RestCreateResponse;

export type DeleteProductTemplateAttributeRequest = dyn.RestDeleteRequest;
export type DeleteProductTemplateAttributeResponse = dyn.RestDeleteResponse;

export type GetProductTemplateAttributeByIdRequest = dyn.RestGetByIdRequest;
export type GetProductTemplateAttributeResponse = dyn.RestGetOneResponse<ProductTemplateAttribute>;

export type SearchProductTemplateAttributesRequest = dyn.RestSearchRequest;
export type SearchProductTemplateAttributesResponse = dyn.RestSearchResponse<ProductTemplateAttribute>;

export type UpdateProductTemplateAttributeRequest = dyn.RestUpdateRequest;
export type UpdateProductTemplateAttributeResponse = dyn.RestMutateResponse;
