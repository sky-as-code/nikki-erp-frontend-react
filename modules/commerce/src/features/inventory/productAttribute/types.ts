import * as dyn from '@nikkierp/common/dynamicModel';


/** How an attribute's values are rendered in a configurator. */
export type AttributeDisplayType = 'radio' | 'select' | 'color';

/** What kind of value the attribute holds. */
export type AttributeDataType = 'option' | 'text' | 'number' | 'date' | 'boolean';

/**
 * Whether and when an attribute's values produce variants.
 *
 * `never` keeps the attribute out of the combination key entirely — it carries information but
 * never creates a variant. See BR §4.7 and §6.5.3.
 */
export type VariantCreationMode = 'instant' | 'dynamic' | 'never';

export type ProductAttribute = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	data_type?: AttributeDataType,
	variant_creation_mode?: VariantCreationMode,
	display_type?: AttributeDisplayType,
	sequence?: number,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductAttributeRequest = Record<string, any>;
export type CreateProductAttributeResponse = dyn.RestCreateResponse;

export type DeleteProductAttributeRequest = dyn.RestDeleteRequest;
export type DeleteProductAttributeResponse = dyn.RestDeleteResponse;

export type GetProductAttributeSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductAttributeByIdRequest = dyn.RestGetByIdRequest;
export type GetProductAttributeResponse = dyn.RestGetOneResponse<ProductAttribute>;

export type ProductAttributeExistsRequest = dyn.RestExistsRequest;
export type ProductAttributeExistsResponse = dyn.RestExistsResponse;

export type SearchProductAttributesRequest = dyn.RestSearchRequest;
export type SearchProductAttributesResponse = dyn.RestSearchResponse<ProductAttribute>;

export type UpdateProductAttributeRequest = dyn.RestUpdateRequest;
export type UpdateProductAttributeResponse = dyn.RestMutateResponse;
