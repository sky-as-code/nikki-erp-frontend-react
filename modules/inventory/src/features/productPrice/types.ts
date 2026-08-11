import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A price rule for a product template or one of its variants. See BR §6.12.
 *
 * Exactly one of `product_template_id` and `product_variant_id` is set: neither leaves the rule
 * unreachable, and both make precedence ambiguous. The backend schema enforces it, so the form
 * reports a field error rather than the UI having to pre-empt it.
 *
 * `price` is a string because a decimal sent as a JSON number loses precision in most clients.
 */
export type ProductPrice = {
	id: string,
	product_template_id?: string,
	product_variant_id?: string,
	price?: string,
	effective_from?: string,
	effective_to?: string,
	status?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductPriceRequest = Record<string, any>;
export type CreateProductPriceResponse = dyn.RestCreateResponse;

export type DeleteProductPriceRequest = dyn.RestDeleteRequest;
export type DeleteProductPriceResponse = dyn.RestDeleteResponse;

export type GetProductPriceSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetProductPriceByIdRequest = dyn.RestGetByIdRequest;
export type GetProductPriceResponse = dyn.RestGetOneResponse<ProductPrice>;

export type ProductPriceExistsRequest = dyn.RestExistsRequest;
export type ProductPriceExistsResponse = dyn.RestExistsResponse;

export type SearchProductPricesRequest = dyn.RestSearchRequest;
export type SearchProductPricesResponse = dyn.RestSearchResponse<ProductPrice>;

export type UpdateProductPriceRequest = dyn.RestUpdateRequest;
export type UpdateProductPriceResponse = dyn.RestMutateResponse;
