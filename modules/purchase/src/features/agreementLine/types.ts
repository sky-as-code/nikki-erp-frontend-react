import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One line of an agreement: a product, the quantity committed to, and the agreed price.
 *
 * It carries NO `ordered_quantity`. How much has been drawn against the line is derived on read
 * from the confirmed orders referencing it (§41), because a stored copy would need invalidating
 * from the order side — and the day one path forgot, the agreement would misreport its own
 * drawdown with nothing to reconcile against.
 */
export type AgreementLine = {
	id: string,
	purchase_agreement_id?: string,
	sequence?: number,
	product_variant_id?: string,
	uom_id?: string,
	quantity?: string,
	unit_price?: string,
	description?: string,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateAgreementLineRequest = Record<string, any>;
export type CreateAgreementLineResponse = dyn.RestCreateResponse;

export type DeleteAgreementLineRequest = dyn.RestDeleteRequest;
export type DeleteAgreementLineResponse = dyn.RestDeleteResponse;

export type GetAgreementLineSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetAgreementLineByIdRequest = dyn.RestGetByIdRequest;
export type GetAgreementLineResponse = dyn.RestGetOneResponse<AgreementLine>;

export type AgreementLineExistsRequest = dyn.RestExistsRequest;
export type AgreementLineExistsResponse = dyn.RestExistsResponse;

export type SearchAgreementLinesRequest = dyn.RestSearchRequest;
export type SearchAgreementLinesResponse = dyn.RestSearchResponse<AgreementLine>;

export type UpdateAgreementLineRequest = dyn.RestUpdateRequest;
export type UpdateAgreementLineResponse = dyn.RestMutateResponse;
