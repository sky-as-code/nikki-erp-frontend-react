import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesBillLine = {
	id: string,
	sales_bill_id?: string,
	sales_order_line_id?: string,
	quantity?: string,
	allocated_net_amount?: string,
	allocated_tax_amount?: string,
	allocated_total_amount?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesBillLineRequest = Record<string, any>;
export type CreateSalesBillLineResponse = dyn.RestCreateResponse;

export type DeleteSalesBillLineRequest = dyn.RestDeleteRequest;
export type DeleteSalesBillLineResponse = dyn.RestDeleteResponse;

export type GetSalesBillLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesBillLineByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesBillLineResponse = dyn.RestGetOneResponse<SalesBillLine>;

export type SalesBillLineExistsRequest = dyn.RestExistsRequest;
export type SalesBillLineExistsResponse = dyn.RestExistsResponse;

export type SearchSalesBillLinesRequest = dyn.RestSearchRequest;
export type SearchSalesBillLinesResponse = dyn.RestSearchResponse<SalesBillLine>;

export type UpdateSalesBillLineRequest = dyn.RestUpdateRequest;
export type UpdateSalesBillLineResponse = dyn.RestMutateResponse;
