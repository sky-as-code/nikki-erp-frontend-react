import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One line of a purchase order.
 *
 * `line_type` is what makes a line more than a product row: `section` and `subsection` are
 * headings and `note` is free text, none of which carry money. Only a `product` line is priced,
 * and the totals engine skips the rest ([PUR-014]).
 *
 * The money fields are strings for the same reason as the order's, and `subtotal`, `tax_amount`
 * and `total` are computed by the backend on every write — never sent from here.
 */
export type PurchaseOrderLine = {
	id: string,
	purchase_order_id?: string,
	sequence?: number,
	line_type?: string,
	product_variant_id?: string,
	description?: string,
	quantity?: string,
	uom_id?: string,

	/** The quantity restated in the product's inventory unit, so stock can be reconciled. */
	inventory_quantity?: string,

	unit_price?: string,
	discount_percent?: string,
	expected_arrival?: string,

	/** Computed by the backend. Read-only here. */
	subtotal?: string,
	tax_amount?: string,
	total?: string,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreatePurchaseOrderLineRequest = Record<string, any>;
export type CreatePurchaseOrderLineResponse = dyn.RestCreateResponse;

export type DeletePurchaseOrderLineRequest = dyn.RestDeleteRequest;
export type DeletePurchaseOrderLineResponse = dyn.RestDeleteResponse;

export type GetPurchaseOrderLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetPurchaseOrderLineByIdRequest = dyn.RestGetByIdRequest;
export type GetPurchaseOrderLineResponse = dyn.RestGetOneResponse<PurchaseOrderLine>;

export type PurchaseOrderLineExistsRequest = dyn.RestExistsRequest;
export type PurchaseOrderLineExistsResponse = dyn.RestExistsResponse;

export type SearchPurchaseOrderLinesRequest = dyn.RestSearchRequest;
export type SearchPurchaseOrderLinesResponse = dyn.RestSearchResponse<PurchaseOrderLine>;

export type UpdatePurchaseOrderLineRequest = dyn.RestUpdateRequest;
export type UpdatePurchaseOrderLineResponse = dyn.RestMutateResponse;
