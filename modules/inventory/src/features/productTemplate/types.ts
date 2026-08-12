import * as dyn from '@nikkierp/common/dynamicModel';

import type { VariantCreationMode } from '../productAttribute/types';


/**
 * Commercial lifecycle, independent of `is_archived`.
 *
 * `is_archived` is system visibility; a discontinued product may stay unarchived so it still
 * appears in discontinued-product listings. See BR §2.3 and AC-PROD-018.
 */
export type ProductTemplateStatus = 'draft' | 'active' | 'discontinued';

/**
 * The template is the product as a customer thinks of it — "Classic T-Shirt". What is actually
 * stocked and sold is one of its variants. See BR §2.
 *
 * Dimensions and weight are decimals carried as strings: a JSON number is parsed as a float64 by
 * most clients, which would lose precision. An absent value means "not set", never zero.
 */
export type ProductTemplate = {
	id: string,
	name?: dyn.ModelSchemaLangJson,
	short_name?: string,
	product_type_id?: string,
	category_id?: string,
	brand_id?: string,
	status?: ProductTemplateStatus,
	sale_ok?: boolean,
	purchase_ok?: boolean,
	description?: dyn.ModelSchemaLangJson,
	sales_description?: dyn.ModelSchemaLangJson,
	purchase_description?: dyn.ModelSchemaLangJson,
	default_image_id?: string,
	default_weight?: string,
	default_length?: string,
	default_width?: string,
	default_height?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductTemplateRequest = Record<string, any>;
export type CreateProductTemplateResponse = dyn.RestCreateResponse;

export type DeleteProductTemplateRequest = dyn.RestDeleteRequest;
export type DeleteProductTemplateResponse = dyn.RestDeleteResponse;

export type GetProductTemplateSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductTemplateByIdRequest = dyn.RestGetByIdRequest;
export type GetProductTemplateResponse = dyn.RestGetOneResponse<ProductTemplate>;

export type ProductTemplateExistsRequest = dyn.RestExistsRequest;
export type ProductTemplateExistsResponse = dyn.RestExistsResponse;

export type SearchProductTemplatesRequest = dyn.RestSearchRequest;
export type SearchProductTemplatesResponse = dyn.RestSearchResponse<ProductTemplate>;

export type UpdateProductTemplateRequest = dyn.RestUpdateRequest;
export type UpdateProductTemplateResponse = dyn.RestMutateResponse;

// The two custom actions the template engine defines beyond CRUD. Their shapes must match the
// backend view structs verbatim — see
// backend .../modules/inventory/interfaces/product/views.go.

/** One attribute-value choice, as `resolve_selection` expects it. */
export type AttributeSelectionInput = {
	attribute_id: string,
	value_id: string,
	/** An unrecognized mode falls back to `instant`, which keeps the attribute in the key. */
	mode?: VariantCreationMode,
};

export type ResolveSelectionRequest = {
	template_id: string,
	selections: AttributeSelectionInput[],
	/**
	 * Creates the variant when the combination is valid but has no variant yet, which is what a
	 * DYNAMIC-mode template needs. Left false, an unknown combination resolves to nothing rather
	 * than silently creating master data.
	 */
	materialize_if_missing?: boolean,
};

export type ResolveSelectionResponse = {
	variant_id?: string,
	combination_key: string,
	materialized: boolean,
};

export type GenerateVariantsRequest = Record<string, never>;

export type GenerateVariantsResponse = {
	created_variant_ids: string[],
	/**
	 * Reported rather than removed: a variant a transaction already references must be archived,
	 * not deleted, and only the caller knows which. See BR §8.5 and AC-PROD-030.
	 */
	obsolete_variant_ids: string[],
	unchanged_count: number,
};
