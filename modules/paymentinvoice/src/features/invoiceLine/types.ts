import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One line of an invoice.
 *
 * `amount` is recomputed as `quantity * unit_price` when the invoice is issued rather than trusted
 * from whatever was last written: the quantity and the price are what a reader can verify, so a
 * stored amount that disagrees with them is the field that is wrong.
 */
export type InvoiceLine = {
	id: string,
	invoice_id?: string,
	description?: string,

	/** int32 on the backend, so an ordinary number here. */
	quantity?: number,

	/** Decimal strings: the exact figures survive JSON only as text. */
	unit_price?: string,
	tax_rate_percent?: string,
	amount?: string,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateInvoiceLineRequest = Record<string, any>;
export type CreateInvoiceLineResponse = dyn.RestCreateResponse;

export type DeleteInvoiceLineRequest = dyn.RestDeleteRequest;
export type DeleteInvoiceLineResponse = dyn.RestDeleteResponse;

export type GetInvoiceLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetInvoiceLineByIdRequest = dyn.RestGetByIdRequest;
export type GetInvoiceLineResponse = dyn.RestGetOneResponse<InvoiceLine>;

export type InvoiceLineExistsRequest = dyn.RestExistsRequest;
export type InvoiceLineExistsResponse = dyn.RestExistsResponse;

export type SearchInvoiceLinesRequest = dyn.RestSearchRequest;
export type SearchInvoiceLinesResponse = dyn.RestSearchResponse<InvoiceLine>;

export type UpdateInvoiceLineRequest = dyn.RestUpdateRequest;
export type UpdateInvoiceLineResponse = dyn.RestMutateResponse;
