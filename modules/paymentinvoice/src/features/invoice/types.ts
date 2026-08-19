import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * An accounting document for a sale.
 *
 * `number`, `status`, `issued_at` and the three totals are system-managed: a draft has no number
 * and zero totals, and the issue action is the only thing that sets them. Sending them on an
 * update is silently ignored by the engine rather than honoured.
 */
export type Invoice = {
	id: string,

	/** `INV-{year}-{sequence}`. Absent while the invoice is a draft. */
	number?: string,

	/** `draft`, `issued`, `paid` or `void`. */
	status?: string,

	/** The payment order this invoice accounts for, if any. An invoice may exist without one. */
	order_id?: string,

	partner_name?: string,
	partner_tax_code?: string,
	partner_address?: string,
	currency_id?: string,

	/** Recomputed from the lines on issue, and never accepted from a client — an invoice whose
	 * total disagrees with what it totals is the one thing it must never be. */
	subtotal_amount?: string,
	tax_amount?: string,
	total_amount?: string,

	issued_at?: string,
	note?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateInvoiceRequest = Record<string, any>;
export type CreateInvoiceResponse = dyn.RestCreateResponse;

export type DeleteInvoiceRequest = dyn.RestDeleteRequest;
export type DeleteInvoiceResponse = dyn.RestDeleteResponse;

export type GetInvoiceSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetInvoiceByIdRequest = dyn.RestGetByIdRequest;
export type GetInvoiceResponse = dyn.RestGetOneResponse<Invoice>;

export type InvoiceExistsRequest = dyn.RestExistsRequest;
export type InvoiceExistsResponse = dyn.RestExistsResponse;

export type SearchInvoicesRequest = dyn.RestSearchRequest;
export type SearchInvoicesResponse = dyn.RestSearchResponse<Invoice>;

export type UpdateInvoiceRequest = dyn.RestUpdateRequest;
export type UpdateInvoiceResponse = dyn.RestMutateResponse;
