import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesOrderAdjustment = {
	id: string,
	sales_order_id?: string,
	sales_order_line_id?: string,
	sequence?: string,
	adjustment_type?: string,
	source_type?: string,
	source_id?: string,
	description?: string,
	base_amount?: string,
	adjustment_amount?: string,
	sales_return_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderAdjustmentRequest = Record<string, any>;
export type CreateSalesOrderAdjustmentResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderAdjustmentRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderAdjustmentResponse = dyn.RestDeleteResponse;

export type GetSalesOrderAdjustmentSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderAdjustmentByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderAdjustmentResponse = dyn.RestGetOneResponse<SalesOrderAdjustment>;

export type SalesOrderAdjustmentExistsRequest = dyn.RestExistsRequest;
export type SalesOrderAdjustmentExistsResponse = dyn.RestExistsResponse;

export type SearchSalesOrderAdjustmentsRequest = dyn.RestSearchRequest;
export type SearchSalesOrderAdjustmentsResponse = dyn.RestSearchResponse<SalesOrderAdjustment>;

export type UpdateSalesOrderAdjustmentRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderAdjustmentResponse = dyn.RestMutateResponse;
