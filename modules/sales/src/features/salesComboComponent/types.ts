import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesComboComponent = {
	id: string,
	sales_combo_id?: string,
	product_variant_id?: string,
	quantity?: string,
	uom_id?: string,
	is_required?: string,
	selection_group?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesComboComponentRequest = Record<string, any>;
export type CreateSalesComboComponentResponse = dyn.RestCreateResponse;

export type DeleteSalesComboComponentRequest = dyn.RestDeleteRequest;
export type DeleteSalesComboComponentResponse = dyn.RestDeleteResponse;

export type GetSalesComboComponentSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesComboComponentByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesComboComponentResponse = dyn.RestGetOneResponse<SalesComboComponent>;

export type SalesComboComponentExistsRequest = dyn.RestExistsRequest;
export type SalesComboComponentExistsResponse = dyn.RestExistsResponse;

export type SearchSalesComboComponentsRequest = dyn.RestSearchRequest;
export type SearchSalesComboComponentsResponse = dyn.RestSearchResponse<SalesComboComponent>;

export type UpdateSalesComboComponentRequest = dyn.RestUpdateRequest;
export type UpdateSalesComboComponentResponse = dyn.RestMutateResponse;
