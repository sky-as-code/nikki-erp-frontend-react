import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesOrderLineComponent = {
	id: string,
	sales_order_line_id?: string,
	sequence?: string,
	product_variant_id?: string,
	product_code_snapshot?: string,
	product_name_snapshot?: string,
	quantity?: string,
	uom_id?: string,
	allocated_net_amount?: string,
	allocated_tax_amount?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderLineComponentRequest = Record<string, any>;
export type CreateSalesOrderLineComponentResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderLineComponentRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderLineComponentResponse = dyn.RestDeleteResponse;

export type GetSalesOrderLineComponentSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderLineComponentByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderLineComponentResponse = dyn.RestGetOneResponse<SalesOrderLineComponent>;

export type SalesOrderLineComponentExistsRequest = dyn.RestExistsRequest;
export type SalesOrderLineComponentExistsResponse = dyn.RestExistsResponse;

export type SearchSalesOrderLineComponentsRequest = dyn.RestSearchRequest;
export type SearchSalesOrderLineComponentsResponse = dyn.RestSearchResponse<SalesOrderLineComponent>;

export type UpdateSalesOrderLineComponentRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderLineComponentResponse = dyn.RestMutateResponse;
