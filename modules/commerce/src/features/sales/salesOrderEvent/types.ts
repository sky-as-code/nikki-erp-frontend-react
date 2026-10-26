import * as dyn from '@nikkierp/common/dynamicModel';


/** Read-only over HTTP: an audit trail a client can write is not one. */
export type SalesOrderEvent = {
	id: string,
	sales_order_id?: string,
	entity_type?: string,
	entity_id?: string,
	action?: string,
	actor_id?: string,
	from_status?: string,
	to_status?: string,
	reason?: string,
	metadata?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type CreateSalesOrderEventRequest = Record<string, any>;
export type CreateSalesOrderEventResponse = dyn.RestCreateResponse;

export type DeleteSalesOrderEventRequest = dyn.RestDeleteRequest;
export type DeleteSalesOrderEventResponse = dyn.RestDeleteResponse;

export type GetSalesOrderEventSchemaResponse = dyn.RestGetModelSchemaResponse;

export type GetSalesOrderEventByIdRequest = dyn.RestGetByIdRequest;
export type GetSalesOrderEventResponse = dyn.RestGetOneResponse<SalesOrderEvent>;

export type SalesOrderEventExistsRequest = dyn.RestExistsRequest;
export type SalesOrderEventExistsResponse = dyn.RestExistsResponse;

export type SearchSalesOrderEventsRequest = dyn.RestSearchRequest;
export type SearchSalesOrderEventsResponse = dyn.RestSearchResponse<SalesOrderEvent>;

export type UpdateSalesOrderEventRequest = dyn.RestUpdateRequest;
export type UpdateSalesOrderEventResponse = dyn.RestMutateResponse;
