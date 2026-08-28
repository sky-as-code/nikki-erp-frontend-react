import * as dyn from '@nikkierp/common/dynamicModel';


export type SalesBillRelation = {
	id: string,
	source_bill_id?: string,
	target_bill_id?: string,
	relation_type?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesBillRelationRequest = Record<string, any>;
export type CreateSalesBillRelationResponse = dyn.RestCreateResponse;

export type DeleteSalesBillRelationRequest = dyn.RestDeleteRequest;
export type DeleteSalesBillRelationResponse = dyn.RestDeleteResponse;

export type GetSalesBillRelationSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesBillRelationByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesBillRelationResponse = dyn.RestGetOneResponse<SalesBillRelation>;

export type SalesBillRelationExistsRequest = dyn.RestExistsRequest;
export type SalesBillRelationExistsResponse = dyn.RestExistsResponse;

export type SearchSalesBillRelationsRequest = dyn.RestSearchRequest;
export type SearchSalesBillRelationsResponse = dyn.RestSearchResponse<SalesBillRelation>;

export type UpdateSalesBillRelationRequest = dyn.RestUpdateRequest;
export type UpdateSalesBillRelationResponse = dyn.RestMutateResponse;
