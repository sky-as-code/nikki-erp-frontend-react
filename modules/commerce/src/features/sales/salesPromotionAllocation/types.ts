import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Read-only: an application's share on one order line, split by the largest-remainder rule.
 */
export type SalesPromotionAllocation = {
	id: string,
	application_id?: string,
	order_line_id?: string,
	allocation_type?: string,
	eligible_quantity?: string,
	uom_id?: string,
	base_untaxed_amount?: string,
	discount_untaxed_amount?: string,
	tax_reduction_amount?: string,
	discount_total_amount?: string,
	calculation_sequence?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionAllocationRequest = Record<string, any>;
export type CreateSalesPromotionAllocationResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionAllocationRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionAllocationResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionAllocationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionAllocationByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionAllocationResponse = dyn.RestGetOneResponse<SalesPromotionAllocation>;

export type SearchSalesPromotionAllocationsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionAllocationsResponse = dyn.RestSearchResponse<SalesPromotionAllocation>;

export type UpdateSalesPromotionAllocationRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionAllocationResponse = dyn.RestMutateResponse;
