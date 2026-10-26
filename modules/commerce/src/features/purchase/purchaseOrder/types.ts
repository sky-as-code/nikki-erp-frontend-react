import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A purchase order: one document, whose `status` says whether it is still a request for quotation
 * or a committed order (PUR-R1). RFQ and PO are two views of this type, never two types.
 *
 * The money fields are strings rather than numbers because the backend stores them as decimals and
 * serialises them as strings — reading them as numbers would round the ones a float64 cannot hold.
 * All three are computed by the backend from the lines and must never be written from here.
 */
export type PurchaseOrder = {
	id: string,

	/** `PO-{ULID}`, allocated by the backend on create. */
	code?: string,

	status?: string,
	vendor_id?: string,

	/** The vendor's own reference for this order — their quotation number. */
	vendor_reference?: string,

	/** What caused this order to be raised, when something did. */
	source_reference?: string,

	buyer_id?: string,
	currency_id?: string,
	order_deadline?: string,
	expected_arrival?: string,
	confirmed_at?: string,

	/** The blanket order or template this was drawn against, when it was drawn against one. */
	agreement_id?: string,

	/** Set when this order is one of several alternatives for the same requirement (§28). */
	sourcing_group_id?: string,

	priority?: string,
	terms_conditions?: string,
	is_locked?: boolean,
	vendor_acknowledged?: boolean,

	/** Computed from the lines by the backend ([PUR-014]). Read-only here. */
	untaxed_amount?: string,
	tax_amount?: string,
	total_amount?: string,

	/** Set at confirmation from the organization's approval configuration, not by the user. */
	approval_required?: boolean,
	approved_by?: string,
	approved_at?: string,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreatePurchaseOrderRequest = Record<string, any>;
export type CreatePurchaseOrderResponse = dyn.RestCreateResponse;

export type DeletePurchaseOrderRequest = dyn.RestDeleteRequest;
export type DeletePurchaseOrderResponse = dyn.RestDeleteResponse;

export type GetPurchaseOrderSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetPurchaseOrderByIdRequest = dyn.RestGetByIdRequest;
export type GetPurchaseOrderResponse = dyn.RestGetOneResponse<PurchaseOrder>;

export type PurchaseOrderExistsRequest = dyn.RestExistsRequest;
export type PurchaseOrderExistsResponse = dyn.RestExistsResponse;

export type SearchPurchaseOrdersRequest = dyn.RestSearchRequest;
export type SearchPurchaseOrdersResponse = dyn.RestSearchResponse<PurchaseOrder>;

export type UpdatePurchaseOrderRequest = dyn.RestUpdateRequest;
export type UpdatePurchaseOrderResponse = dyn.RestMutateResponse;
