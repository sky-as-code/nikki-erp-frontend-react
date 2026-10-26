import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesQuotationLine = {
	id: string,
	sales_quotation_id?: string,
	line_number?: string,
	product_variant_id?: string,
	product_code_snapshot?: string,
	product_name_snapshot?: string,
	uom_id?: string,
	quantity?: string,
	unit_price?: string,
	discount_amount?: string,
	net_amount?: string,
	tax_amount?: string,
	final_amount?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesQuotationLineRequest = Record<string, any>;
export type CreateSalesQuotationLineResponse = dyn.RestCreateResponse;

export type DeleteSalesQuotationLineRequest = dyn.RestDeleteRequest;
export type DeleteSalesQuotationLineResponse = dyn.RestDeleteResponse;

export type GetSalesQuotationLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesQuotationLineByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesQuotationLineResponse = dyn.RestGetOneResponse<SalesQuotationLine>;

export type SalesQuotationLineExistsRequest = dyn.RestExistsRequest;
export type SalesQuotationLineExistsResponse = dyn.RestExistsResponse;

export type SearchSalesQuotationLinesRequest = dyn.RestSearchRequest;
export type SearchSalesQuotationLinesResponse = dyn.RestSearchResponse<SalesQuotationLine>;

export type UpdateSalesQuotationLineRequest = dyn.RestUpdateRequest;
export type UpdateSalesQuotationLineResponse = dyn.RestMutateResponse;
