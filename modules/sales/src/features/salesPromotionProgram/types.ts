import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One engine serves automatic, conditional and voucher-activated programs: the activation type is
 * data, not three implementations. `stack_policy` and `exclusive_group` decide what may combine
 * with what; an empty group is not a group.
 */
export type SalesPromotionProgram = {
	id: string,
	code?: string,
	name?: string,
	activation_type?: string,
	priority?: string,
	valid_from?: string,
	valid_until?: string,
	stack_policy?: string,
	exclusive_group?: string,
	usage_limit?: string,
	usage_limit_per_customer?: string,
	return_behavior?: string,
	restore_on_full_return?: string,
	restore_on_partial_return?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionProgramRequest = Record<string, any>;
export type CreateSalesPromotionProgramResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionProgramRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionProgramResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionProgramSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionProgramByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionProgramResponse = dyn.RestGetOneResponse<SalesPromotionProgram>;

export type SalesPromotionProgramExistsRequest = dyn.RestExistsRequest;
export type SalesPromotionProgramExistsResponse = dyn.RestExistsResponse;

export type SearchSalesPromotionProgramsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionProgramsResponse = dyn.RestSearchResponse<SalesPromotionProgram>;

export type UpdateSalesPromotionProgramRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionProgramResponse = dyn.RestMutateResponse;
