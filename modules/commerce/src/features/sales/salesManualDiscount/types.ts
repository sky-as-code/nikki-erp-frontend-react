import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesManualDiscount = {
	id: string,
	sales_order_id?: string,
	sales_order_line_id?: string,
	discount_amount?: string,
	reason?: string,
	granted_by?: string,
	original_amount?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesManualDiscountRequest = Record<string, any>;
export type CreateSalesManualDiscountResponse = dyn.RestCreateResponse;

export type DeleteSalesManualDiscountRequest = dyn.RestDeleteRequest;
export type DeleteSalesManualDiscountResponse = dyn.RestDeleteResponse;

export type GetSalesManualDiscountSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesManualDiscountByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesManualDiscountResponse = dyn.RestGetOneResponse<SalesManualDiscount>;

export type SalesManualDiscountExistsRequest = dyn.RestExistsRequest;
export type SalesManualDiscountExistsResponse = dyn.RestExistsResponse;

export type SearchSalesManualDiscountsRequest = dyn.RestSearchRequest;
export type SearchSalesManualDiscountsResponse = dyn.RestSearchResponse<SalesManualDiscount>;

export type UpdateSalesManualDiscountRequest = dyn.RestUpdateRequest;
export type UpdateSalesManualDiscountResponse = dyn.RestMutateResponse;
