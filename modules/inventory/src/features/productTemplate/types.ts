import * as dyn from '@nikkierp/common/dynamicModel';

/**
 * Commercial lifecycle, independent of `is_archived`.
 *
 * `is_archived` is system visibility; a discontinued product may stay unarchived so it still
 * appears in discontinued-product listings. See BR §2.3 and AC-PROD-018.
 */
export type ProductTemplateStatus = 'draft' | 'active' | 'discontinued';

/**
 * How the system processes the product: goods are tracked in stock, services never are.
 * `is_combo` does not change that, so a goods combo is stocked and a service combo is not.
 */
export type ProductType = 'goods' | 'service';

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
	product_type?: ProductType,
	is_combo?: boolean,
	category_id?: string,
	brand_id?: string,
	status?: ProductTemplateStatus,
	sale_ok?: boolean,
	purchase_ok?: boolean,
	description?: dyn.ModelSchemaLangJson,
	sales_description?: dyn.ModelSchemaLangJson,
	purchase_description?: dyn.ModelSchemaLangJson,
	default_image_file_path?: string | null,
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

// The custom actions the template engine defines beyond CRUD. Their shapes must match the
// backend views verbatim — see backend .../modules/inventory/interfaces/product/.

/** One attribute-value choice, as `resolve_selection` expects it. */
export type AttributeSelectionInput = {
	attribute_id: string,
	value_id: string,
};

/**
 * Turns a full selection (one value per instant and dynamic attribute) into the complete variant.
 * Never-mode values may be passed too: they are validated and echoed back, never stored.
 */
export type ResolveSelectionRequest = {
	product_template_id: string,
	selections: AttributeSelectionInput[],
	/** Refuses the resolve when the template moved past this etag. */
	expected_etag?: string,
	/**
	 * Creates (or restores) the complete variant when the combination is valid but has none, which
	 * needs the `generate_variants` permission. Left false, a missing combination reports `missing`.
	 */
	materialize_if_missing?: boolean,
};

export type ResolveOutcome = 'existing' | 'created' | 'restored' | 'missing';

export type ResolveSelectionResponse = {
	variant_id?: string,
	base_variant_id?: string,
	combination_key: string,
	outcome: ResolveOutcome,
	materialized: boolean,
	never_selections?: AttributeSelectionInput[],
};

export type GenerateVariantsRequest = Record<string, never>;

export type GenerateVariantsResponse = {
	created_variant_ids: string[],
	extended_variant_ids: string[],
	restored_variant_ids: string[],
	archived_variant_ids: string[],
	deleted_variant_ids: string[],
	obsolete_variant_ids: string[],
	unchanged_count: number,
};

/** `POST product_template/:id/copy`: the copy's name is optional, the source's name plus a suffix otherwise. */
export type CopyTemplateRequest = { id: string, name?: dyn.ModelSchemaLangJson };

export type CopyTemplateResponse = { id: string, etag: string, created_at: string };

export type PreviewAttributeConfigurationRequest = {
	id: string,
	etag: string,
	attribute_lines: { attribute_id: string, value_ids: string[], sequence?: number }[],
	exclusions: { left_value_id: string, right_value_id: string }[],
};
