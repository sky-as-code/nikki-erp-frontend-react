import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A standing arrangement with a vendor: either a blanket order committing to quantities at agreed
 * prices, or a reusable template with no commitment attached.
 *
 * Unlike an order it is archivable — an agreement can fall out of use without being cancelled,
 * and archiving takes it out of the working set while leaving the orders drawn against it intact.
 */
export type Agreement = {
	id: string,

	/** `PA-{ULID}`, allocated by the backend on create. */
	code?: string,

	reference?: string,
	agreement_type?: string,
	status?: string,

	/** Optional, unlike on an order: a template may be drafted before the vendor is chosen. */
	vendor_id?: string,

	buyer_id?: string,
	currency_id?: string,
	start_date?: string,
	end_date?: string,
	description?: string,
	is_archived?: boolean,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateAgreementRequest = Record<string, any>;
export type CreateAgreementResponse = dyn.RestCreateResponse;

export type DeleteAgreementRequest = dyn.RestDeleteRequest;
export type DeleteAgreementResponse = dyn.RestDeleteResponse;

export type GetAgreementSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetAgreementByIdRequest = dyn.RestGetByIdRequest;
export type GetAgreementResponse = dyn.RestGetOneResponse<Agreement>;

export type AgreementExistsRequest = dyn.RestExistsRequest;
export type AgreementExistsResponse = dyn.RestExistsResponse;

export type SearchAgreementsRequest = dyn.RestSearchRequest;
export type SearchAgreementsResponse = dyn.RestSearchResponse<Agreement>;

export type UpdateAgreementRequest = dyn.RestUpdateRequest;
export type UpdateAgreementResponse = dyn.RestMutateResponse;
