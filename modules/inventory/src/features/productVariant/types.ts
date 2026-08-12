import * as dyn from '@nikkierp/common/dynamicModel';


/** Commercial lifecycle of a variant, independent of `is_archived`. See BR §6.2.2. */
export type ProductVariantStatus = 'active' | 'discontinued';

/**
 * Why a variant was archived.
 *
 * Unarchiving a template restores only the variants it cascaded to and leaves deliberately
 * archived ones alone — a plain boolean cannot express that. See BR §8.9 and BR-PROD-TPL-003.
 */
export type ArchiveSource = 'user' | 'template_cascade' | 'system_sync';

/**
 * The variant is what is actually stocked, priced and sold. Its identity within a template is
 * `combination_key`, and the pair (template, combination) is unique.
 *
 * Dimensions and weight are decimals carried as strings, and an absent value means "inherit from
 * the template", never zero.
 */
export type ProductVariant = {
	id: string,
	product_template_id?: string,
	combination_key?: string,
	sku?: string,
	primary_barcode?: string,
	status?: ProductVariantStatus,
	/** False while the variant is only implied by its template's attributes. See BR §8.3. */
	is_materialized?: boolean,
	archive_source?: ArchiveSource,
	variant_image_id?: string,
	weight?: string,
	length?: string,
	width?: string,
	height?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductVariantRequest = Record<string, any>;
export type CreateProductVariantResponse = dyn.RestCreateResponse;

export type DeleteProductVariantRequest = dyn.RestDeleteRequest;
export type DeleteProductVariantResponse = dyn.RestDeleteResponse;

export type GetProductVariantSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductVariantByIdRequest = dyn.RestGetByIdRequest;
export type GetProductVariantResponse = dyn.RestGetOneResponse<ProductVariant>;

export type ProductVariantExistsRequest = dyn.RestExistsRequest;
export type ProductVariantExistsResponse = dyn.RestExistsResponse;

export type SearchProductVariantsRequest = dyn.RestSearchRequest;
export type SearchProductVariantsResponse = dyn.RestSearchResponse<ProductVariant>;

export type UpdateProductVariantRequest = dyn.RestUpdateRequest;
export type UpdateProductVariantResponse = dyn.RestMutateResponse;

/**
 * A template and variant flattened into the single product a consumer reads.
 *
 * Consumers must not re-derive which fields come from the template and which from the variant —
 * they read this instead, so the inheritance rules live in one place. See AC-PROD-032. The shape
 * matches the backend view verbatim; see
 * backend .../modules/inventory/interfaces/product/views.go.
 */
export type EffectiveProduct = {
	variant_id: string,
	template_id: string,

	name?: dyn.ModelSchemaLangJson,
	/** The template name plus the variant's attribute values — "Classic T-Shirt / Black / M". */
	display_name: string,

	product_type_id?: string,
	category_id?: string,
	brand_id?: string,

	sale_ok: boolean,
	purchase_ok: boolean,

	sku?: string,
	barcode?: string,

	image_id?: string,
	weight?: string,
	length?: string,
	width?: string,
	height?: string,

	template_status?: string,
	variant_status?: string,

	is_template_archived: boolean,
	is_variant_archived: boolean,

	/** Saves every consumer from re-deriving the archive and status rules. */
	is_selectable: boolean,
};

export type GetEffectiveProductResponse = EffectiveProduct;
