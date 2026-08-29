import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `combo_price` is independent and never derived from the components. Component allocation is an
 * output — how the price is spread for tax and returns — never an input to it.
 */
export type SalesCombo = {
	id: string,
	code?: string,
	name?: string,
	description?: string,
	combo_price?: string,
	valid_from?: string,
	valid_until?: string,
	return_policy?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesComboRequest = Record<string, any>;
export type CreateSalesComboResponse = dyn.RestCreateResponse;

export type DeleteSalesComboRequest = dyn.RestDeleteRequest;
export type DeleteSalesComboResponse = dyn.RestDeleteResponse;

export type GetSalesComboSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesComboByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesComboResponse = dyn.RestGetOneResponse<SalesCombo>;

export type SalesComboExistsRequest = dyn.RestExistsRequest;
export type SalesComboExistsResponse = dyn.RestExistsResponse;

export type SearchSalesCombosRequest = dyn.RestSearchRequest;
export type SearchSalesCombosResponse = dyn.RestSearchResponse<SalesCombo>;

export type UpdateSalesComboRequest = dyn.RestUpdateRequest;
export type UpdateSalesComboResponse = dyn.RestMutateResponse;
