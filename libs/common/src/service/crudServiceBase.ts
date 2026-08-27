import { ok, ServiceResult } from '../commandBus';
import * as dyn from '../dynamicModel';
import { EventBus, eventTopic, IEventBus } from '../eventBus';
import { withOrgId } from './orgContext';
import { ClientErrorItem } from '../types/common';



/**
 * Published when any service call comes back rejected for an authorization reason.
 *
 * Declared here rather than in the Shell because this is where every API call funnels —
 * which is also why it catches calls made outside Redux, such as the token refresh inside
 * `RequestMaker`, that a store middleware could never see.
 */
export const SESSION_AUTHORIZATION_ERROR_TOPIC = 'shell:session:authorization_error';


export type CrudServiceOptions = {
	/** Micro-app slug / backend module name, e.g. `iam`. First part of an event topic. */
	moduleName: string,
	/** Registered dynamic-model schema name, e.g. `iam_user`. Second part of an event topic. */
	schemaName: string,
	/** Defaults to the host bus installed by the Shell. Injectable for tests. */
	eventBus?: IEventBus,
};

/** Mutations emit `{module}:{schema}:{action}`; reads emit nothing. */
export type CrudAction =
	'create' | 'update' | 'delete' | 'setIsArchived' | 'manageM2m';

/**
 * CRUD over a dynamic-model resource, driven entirely by its schema name.
 *
 * Every method resolves the schema through the registry, calls the matching
 * {@link dyn.RestApi} method and returns a {@link ServiceResult}. Client errors from a
 * 4xx are passed through; technical failures propagate as thrown exceptions.
 *
 * Subclass it to add resource-specific behaviour; a resource that needs nothing
 * beyond CRUD does not need a subclass at all — see `GenericCrudService`.
 */
export abstract class CrudServiceBase {
	protected readonly moduleName: string;
	protected readonly schemaName: string;
	readonly #eventBus?: IEventBus;

	public constructor(opts: CrudServiceOptions) {
		this.moduleName = opts.moduleName;
		this.schemaName = opts.schemaName;
		this.#eventBus = opts.eventBus;
	}

	public create(
		request: dyn.RestCreateRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestCreateResponse>> {
		return this.emitEvent(
			'create', () => this.withSchema(async schema =>
				schema.restApi.create(await this.withOrgScope(schema, request), primaryResourceId)),
		);
	}

	public update(
		request: dyn.RestUpdateRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.emitEvent(
			'update', () => this.withSchema(async schema =>
				schema.restApi.update(await this.withOrgScope(schema, request), primaryResourceId)),
		);
	}

	/**
	 * Deletes one record (`{id}`) or many (`{ids}`).
	 *
	 * The resource list always publishes `{ids}`, so the fan-out lives here rather
	 * than in each module's command handler. Every id is attempted: `affected_count`
	 * is summed and client errors are accumulated across the batch, so a partial
	 * failure reports both what succeeded and what did not.
	 */
	public async delete(
		request: DeleteRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestDeleteResponse>> {
		const ids = 'ids' in request ? request.ids : [request.id];
		return this.emitEvent('delete', async () => {
			const results = await Promise.all(
				ids.map(id => this.withSchema(async schema =>
					schema.restApi.delete(await this.withOrgScope(schema, { id }), primaryResourceId))),
			);
			return mergeDeleteResults(results);
		});
	}

	public setIsArchived(
		request: dyn.RestSetIsArchivedRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.emitEvent(
			'setIsArchived', () => this.withSchema(async schema =>
				schema.restApi.setIsArchived(await this.withOrgScope(schema, request), primaryResourceId)),
		);
	}

	public manageM2m(
		request: dyn.RestManageM2mRequest, path: string, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.emitEvent(
			'manageM2m', () => this.withSchema(async schema =>
				schema.restApi.manageM2m(await this.withOrgScope(schema, request), path, primaryResourceId)),
		);
	}

	/**
	 * Evaluates one function-kind computed field against an unsaved model.
	 *
	 * Not an `emitEvent` action: this computes and returns a value without touching a record, so
	 * a mutation event would tell listeners a write happened when none did.
	 */
	public computeField(
		request: dyn.RestComputeFieldRequest, fieldName: string, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestComputeFieldResponse>> {
		return this.withSchema(schema => schema.restApi.computeField(request, fieldName, primaryResourceId));
	}

	public getById(
		request: dyn.RestGetByIdRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return this.withSchema(async schema =>
			schema.restApi.getById(await this.withOrgScope(schema, request), primaryResourceId));
	}

	/**
	 * Looks a record up by whichever unique fields `buildSearchParams` encodes,
	 * rather than by primary key.
	 *
	 * `TReq` defaults to any field bag so a caller can pass `{ slug }`, `{ email }` or
	 * `{ id }` without restating the type.
	 */
	public getOne<TReq extends dyn.RequestWithFields & Record<string, any>>(
		request: TReq, buildSearchParams: (req: TReq) => URLSearchParams, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return this.withSchema(async schema =>
			schema.restApi.getOne(await this.withOrgScope(schema, request), buildSearchParams, primaryResourceId));
	}

	public search(
		request: dyn.RestSearchRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestSearchResponse<any>>> {
		return this.withSchema(async schema =>
			schema.restApi.search(await this.withOrgScope(schema, request), primaryResourceId));
	}

	/**
	 * Note `RestApi.exists` takes no `primaryResourceId`, so a nested resource cannot be
	 * existence-checked through its parent path. Accepted here only to keep the signature
	 * uniform across the ten operations; it is deliberately not forwarded.
	 */
	public exists(request: dyn.RestExistsRequest): Promise<ServiceResult<dyn.RestExistsResponse>> {
		return this.withSchema(async schema => schema.restApi.exists(await this.withOrgScope(schema, request)));
	}

	public getModelSchema(primaryResourceId?: string): Promise<ServiceResult<dyn.RestGetModelSchemaResponse>> {
		return this.withSchema(schema => schema.restApi.getModelSchema(primaryResourceId));
	}

	/**
	 * Supplies `org_id` for a resource the backend scopes to an organization.
	 *
	 * Applied to every operation except `getModelSchema` and `computeField`, which opt out
	 * server-side. `getModelSchema` especially: it is how the schema this decision reads is
	 * fetched, so scoping it would deadlock the bootstrap.
	 *
	 * Lives here rather than in each module because this is the one place every call passes
	 * through - hand-written services, the `GenericCrudService` the command bus falls back to,
	 * and with it every metadata-driven view-engine page.
	 */
	protected withOrgScope<TRequest extends object>(
		schema: dyn.SchemaPack, request: TRequest,
	): Promise<TRequest> {
		return withOrgId(request, schema, this.schemaName);
	}

	/**
	 * Resolves this service's schema, runs `fn`, and refreshes the registry when the
	 * response carries a `schema_etag` newer than the cached one.
	 *
	 * Deliberately does NOT catch: a technical failure must propagate so the command
	 * bus can report it as `error` rather than disguising it as a client error.
	 */
	protected async withSchema<TData>(
		fn: (schema: dyn.SchemaPack) => Promise<ServiceResult<TData>>,
	): Promise<ServiceResult<TData>> {
		const result = await dyn.withSchema(this.schemaName, fn);
		this.#emitAuthorizationError(result);
		return result;
	}

	/**
	 * Runs `fn` and, only when it succeeds, publishes `{module}:{schema}:{action}`
	 * carrying the result. A rejected operation (client errors) or a thrown technical
	 * failure emits nothing.
	 */
	protected async emitEvent<TData>(
		action: CrudAction, fn: () => Promise<ServiceResult<TData>>,
	): Promise<ServiceResult<TData>> {
		const result = await fn();
		if (result.clientErrors.length === 0) {
			const bus = this.#eventBus ?? EventBus.instance;
			bus?.publish(eventTopic(this.moduleName, this.schemaName, action), result);
		}
		return result;
	}

	/**
	 * Announces an expired or invalid session so the Shell can send the user to sign-in.
	 *
	 * Emitted from `withSchema` rather than `emitEvent` because a read is just as capable
	 * of being rejected for authorization as a mutation.
	 */
	#emitAuthorizationError(result: ServiceResult<unknown>): void {
		const item = result.clientErrors.find(it => ClientErrorItem.isAuthorizationError(it));
		if (!item) return;
		const bus = this.#eventBus ?? EventBus.instance;
		bus?.publish(SESSION_AUTHORIZATION_ERROR_TOPIC, { key: item.key });
	}
}

export type DeleteRequest = dyn.RestDeleteRequest | { ids: string[] };

/** CRUD with no resource-specific behaviour — what a runtime-defined resource gets. */
export class GenericCrudService extends CrudServiceBase {}

/** Sums `affected_count` and concatenates client errors across a bulk delete. */
function mergeDeleteResults(
	results: Array<ServiceResult<dyn.RestDeleteResponse>>,
): ServiceResult<dyn.RestDeleteResponse> {
	const clientErrors = results.flatMap(it => it.clientErrors);
	if (clientErrors.length > 0) {
		return { data: null, clientErrors };
	}
	const affectedCount = results.reduce((total, it) => total + (it.data?.affected_count ?? 0), 0);
	const affectedAt = results.reduce(
		(latest, it) => (it.data && it.data.affected_at > latest ? it.data.affected_at : latest), '',
	);
	return ok({ affected_count: affectedCount, affected_at: affectedAt });
}
