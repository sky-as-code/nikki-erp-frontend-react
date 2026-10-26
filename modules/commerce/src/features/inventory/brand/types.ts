import * as dyn from '@nikkierp/common/dynamicModel';


/** A brand groups products by their manufacturer or marque. See BR §7. */
export type Brand = {
	id: string,
	code?: string,
	name?: dyn.ModelSchemaLangJson,
	description?: dyn.ModelSchemaLangJson,
	website?: string,
	logo_id?: string,
	country_id?: string,
	org_id?: string,
	is_archived?: boolean,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateBrandRequest = Record<string, any>;
export type CreateBrandResponse = dyn.RestCreateResponse;

export type DeleteBrandRequest = dyn.RestDeleteRequest;
export type DeleteBrandResponse = dyn.RestDeleteResponse;

export type GetBrandSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetBrandByIdRequest = dyn.RestGetByIdRequest;
export type GetBrandResponse = dyn.RestGetOneResponse<Brand>;

export type BrandExistsRequest = dyn.RestExistsRequest;
export type BrandExistsResponse = dyn.RestExistsResponse;

export type SearchBrandsRequest = dyn.RestSearchRequest;
export type SearchBrandsResponse = dyn.RestSearchResponse<Brand>;

export type UpdateBrandRequest = dyn.RestUpdateRequest;
export type UpdateBrandResponse = dyn.RestMutateResponse;
