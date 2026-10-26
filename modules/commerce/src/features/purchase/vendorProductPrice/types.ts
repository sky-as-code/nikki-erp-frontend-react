import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * What one vendor offers one product at, from a given quantity, in a given unit, for a period.
 *
 * It is emphatically not the product's cost. A vendor's offer and what the business has actually
 * paid and valued are different numbers and routinely differ — a product costing 10,200 may be
 * offered at 10,000 by one vendor and 9,500 by another. Cost belongs to Inventory; this is what
 * somebody is asking.
 *
 * A row with no `product_variant_id` prices the whole template, and one naming a variant beats it.
 * Emptiness IS the specificity mechanism, so the field is optional rather than defaulted.
 */
export type VendorProductPrice = {
	id: string,
	vendor_id?: string,
	product_template_id?: string,
	product_variant_id?: string,
	purchase_uom_id?: string,
	currency_id?: string,

	/**
	 * Decimals are strings, never numbers. A decimal sent as a JSON number goes through a float on
	 * the way and loses precision, which on money is a rounding error nobody can trace back.
	 */
	min_quantity?: string,
	unit_price?: string,

	/** Both bounds are optional; an absent one is open-ended rather than closed. */
	valid_from?: string,
	valid_to?: string,

	lead_time_days?: number,
	sequence?: number,

	/** What the VENDOR calls this product, for reconciling their paperwork against ours. */
	vendor_product_code?: string,
	vendor_product_name?: string,

	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateVendorProductPriceRequest = Record<string, any>;
export type CreateVendorProductPriceResponse = dyn.RestCreateResponse;

export type DeleteVendorProductPriceRequest = dyn.RestDeleteRequest;
export type DeleteVendorProductPriceResponse = dyn.RestDeleteResponse;

export type GetVendorProductPriceSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetVendorProductPriceByIdRequest = dyn.RestGetByIdRequest;
export type GetVendorProductPriceResponse = dyn.RestGetOneResponse<VendorProductPrice>;

export type VendorProductPriceExistsRequest = dyn.RestExistsRequest;
export type VendorProductPriceExistsResponse = dyn.RestExistsResponse;

export type SearchVendorProductPricesRequest = dyn.RestSearchRequest;
export type SearchVendorProductPricesResponse = dyn.RestSearchResponse<VendorProductPrice>;

export type UpdateVendorProductPriceRequest = dyn.RestUpdateRequest;
export type UpdateVendorProductPriceResponse = dyn.RestMutateResponse;
