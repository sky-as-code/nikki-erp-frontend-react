import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One promotion program. `reference` is issued by the Sequence `sales.promotion`; `used_count` and
 * `config_version` are server-only. While `active` the configuration is locked (`config_locked`): suspend first.
 */
export type SalesPromotion = {
	id: string,
	reference?: string,
	name?: string,
	description?: string,
	program_type?: string,
	status?: string,
	currency_id?: string,
	starts_at?: string,
	ends_at?: string,
	usage_limit?: string,
	used_count?: string,
	sequence?: string,
	next_voucher_validity_days?: string,
	config_version?: string,
	is_archived?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesPromotionRequest = Record<string, any>;
export type CreateSalesPromotionResponse = dyn.RestCreateResponse;

export type DeleteSalesPromotionRequest = dyn.RestDeleteRequest;
export type DeleteSalesPromotionResponse = dyn.RestDeleteResponse;

export type GetSalesPromotionSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesPromotionByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesPromotionResponse = dyn.RestGetOneResponse<SalesPromotion>;

export type SearchSalesPromotionsRequest = dyn.RestSearchRequest;
export type SearchSalesPromotionsResponse = dyn.RestSearchResponse<SalesPromotion>;

export type UpdateSalesPromotionRequest = dyn.RestUpdateRequest;
export type UpdateSalesPromotionResponse = dyn.RestMutateResponse;
