import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One value a template offers for one of its attributes, and what choosing it adds to the price.
 *
 * The surcharge lives HERE — on Template × Attribute × Value — rather than on the attribute value
 * itself, because the same value surcharges differently on different products: XL on a t-shirt is
 * not XL on a tent. `inventory_product_attribute_value.price_extra` is no longer authoritative for
 * that reason.
 */
export type ProductTemplateAttributeValue = {
	id: string,
	template_attribute_id?: string,
	attribute_value_id?: string,

	/**
	 * A decimal serialised as a string, so it does not pass through a float on the way.
	 *
	 * SIGNED: XL may add 20,000 while a plain colour subtracts. It is summed across a variant's
	 * chosen values to give its effective base sales price, and it must never reach a cost
	 * calculation — a colour that sells for more does not thereby cost more.
	 */
	sales_price_extra?: string,

	sequence?: number,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateProductTemplateAttributeValueRequest = Record<string, any>;
export type CreateProductTemplateAttributeValueResponse = dyn.RestCreateResponse;

export type DeleteProductTemplateAttributeValueRequest = dyn.RestDeleteRequest;
export type DeleteProductTemplateAttributeValueResponse = dyn.RestDeleteResponse;

export type GetProductTemplateAttributeValueByIdRequest = dyn.RestGetByIdRequest;
export type GetProductTemplateAttributeValueResponse =
	dyn.RestGetOneResponse<ProductTemplateAttributeValue>;

export type SearchProductTemplateAttributeValuesRequest = dyn.RestSearchRequest;
export type SearchProductTemplateAttributeValuesResponse =
	dyn.RestSearchResponse<ProductTemplateAttributeValue>;

export type UpdateProductTemplateAttributeValueRequest = dyn.RestUpdateRequest;
export type UpdateProductTemplateAttributeValueResponse = dyn.RestMutateResponse;
