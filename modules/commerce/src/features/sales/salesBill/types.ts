import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The total field is `total_amount` here, not `grand_total` as on the order; reading the wrong one
 * yields undefined rather than an error. Money fields are strings because the backend serialises
 * decimals as strings, and parsing them as numbers would round what a float64 cannot hold.
 */
export type SalesBill = {
	id: string,
	bill_number?: string,
	sales_order_id?: string,
	status?: string,
	payment_status?: string,
	currency_code?: string,
	subtotal?: string,
	discount_total?: string,
	tax_total?: string,
	total_amount?: string,
	settled_at?: string,
	cancelled_at?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesBillRequest = Record<string, any>;
export type CreateSalesBillResponse = dyn.RestCreateResponse;

export type DeleteSalesBillRequest = dyn.RestDeleteRequest;
export type DeleteSalesBillResponse = dyn.RestDeleteResponse;

export type GetSalesBillSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesBillByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesBillResponse = dyn.RestGetOneResponse<SalesBill>;

export type SalesBillExistsRequest = dyn.RestExistsRequest;
export type SalesBillExistsResponse = dyn.RestExistsResponse;

export type SearchSalesBillsRequest = dyn.RestSearchRequest;
export type SearchSalesBillsResponse = dyn.RestSearchResponse<SalesBill>;

export type UpdateSalesBillRequest = dyn.RestUpdateRequest;
export type UpdateSalesBillResponse = dyn.RestMutateResponse;
