import * as dyn from '@nikkierp/common/dynamicModel';


/** Adding, changing and removing a line are plain writes here, not actions on the order. */
export type SalesOrderLine = {
	id: string,
	sales_order_id?: string,
	line_number?: string,
	line_type?: string,
	product_variant_id?: string,
	product_code_snapshot?: string,
	product_name_snapshot?: string,
	uom_id?: string,
	ordered_quantity?: string,
	requires_fulfillment?: string,
	fulfilled_quantity?: string,
	returned_quantity?: string,
	base_unit_price?: string,
	effective_unit_price?: string,
	gross_amount?: string,
	discount_amount?: string,
	net_amount?: string,
	tax_rate_snapshot?: string,
	tax_amount?: string,
	final_amount?: string,
	pricing_source?: string,
	source_promotion_program_id?: string,
	sales_combo_id?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderLineRequest = Record<string, any>;
export type CreateSalesOrderLineResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderLineRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderLineResponse = dyn.RestDeleteResponse;

export type GetSalesOrderLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderLineByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderLineResponse = dyn.RestGetOneResponse<SalesOrderLine>;

export type SalesOrderLineExistsRequest = dyn.RestExistsRequest;
export type SalesOrderLineExistsResponse = dyn.RestExistsResponse;

export type SearchSalesOrderLinesRequest = dyn.RestSearchRequest;
export type SearchSalesOrderLinesResponse = dyn.RestSearchResponse<SalesOrderLine>;

export type UpdateSalesOrderLineRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderLineResponse = dyn.RestMutateResponse;
