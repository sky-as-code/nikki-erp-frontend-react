import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One recorded transition of an order or an agreement.
 *
 * Written by the backend inside the same transaction as the transition it records, and by nothing
 * else (PUR-R6): a client-written event would be a claim that something happened, sitting in the
 * same table as the events that did, with no way for a reader to tell them apart.
 */
export type AuditEvent = {
	id: string,

	/** `purchase_order` or `purchase_agreement` — which kind of record `entity_id` names. */
	entity_type?: string,
	entity_id?: string,

	action?: string,
	from_status?: string,
	to_status?: string,

	/** Supplied for the transitions that require one, notably cancel and unlock. */
	reason?: string,

	/** Whatever else the action recorded. Each action owns its own keys. */
	metadata?: Record<string, any>,

	/** The user who performed it. */
	actor_id?: string,

	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateAuditEventRequest = Record<string, any>;
export type CreateAuditEventResponse = dyn.RestCreateResponse;

export type DeleteAuditEventRequest = dyn.RestDeleteRequest;
export type DeleteAuditEventResponse = dyn.RestDeleteResponse;

export type GetAuditEventSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetAuditEventByIdRequest = dyn.RestGetByIdRequest;
export type GetAuditEventResponse = dyn.RestGetOneResponse<AuditEvent>;

export type AuditEventExistsRequest = dyn.RestExistsRequest;
export type AuditEventExistsResponse = dyn.RestExistsResponse;

export type SearchAuditEventsRequest = dyn.RestSearchRequest;
export type SearchAuditEventsResponse = dyn.RestSearchResponse<AuditEvent>;

export type UpdateAuditEventRequest = dyn.RestUpdateRequest;
export type UpdateAuditEventResponse = dyn.RestMutateResponse;
