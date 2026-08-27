import { RequestMaker } from '../request/request';

import type { ModelSchema } from './model_schema';
import type { RequestResult } from '../request/request';


export type RestApiOptions = {
	requestMaker?: RequestMaker,
	resourcePath: string,
	primaryResourcePath?: string,
};

export class RestApi {
	private _opts: RestApiOptions;
	private _basePath: string = '';

	constructor(opts: RestApiOptions) {
		if (!opts.requestMaker) {
			opts.requestMaker = RequestMaker.default();
		}
		this._opts = opts;
		if (!opts.primaryResourcePath) {
			this._basePath = opts.resourcePath;
		}
	}

	public create(request: RestCreateRequest, primaryResourceId?: string): Promise<RequestResult<RestCreateResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.post<RestCreateResponse>(restPath, { json: request });
	}

	public delete(request: RestDeleteRequest, primaryResourceId?: string): Promise<RequestResult<RestDeleteResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.delete<RestDeleteResponse>(`${restPath}/${request.id}`, { searchParams: request });
	}

	public exists(request: RestExistsRequest): Promise<RequestResult<RestExistsResponse>> {
		const restPath = this._getBasePath();
		return this._opts.requestMaker!.post<RestExistsResponse>(restPath + '/exists', {
			searchParams: this._toSearchParams(request),
		});
	}

	public getById(
		request: RestGetByIdRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestGetOneResponse<any>>> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...rest } = request;
		const keyFields = Object.values(rest).join('/');
		const dedupKey = `GET/${restPath}/${id}/${keyFields}/${rest.fields?.join(',')}`;
		return this._opts.requestMaker!.get<RestGetOneResponse<any>>(`${restPath}/${id}`, {
			searchParams: this._toSearchParams(rest),
			dedupKey,
		});
	}

	public getOne<TReq extends RequestWithFields = RestGetByIdRequest>(
		request: TReq, buildSearchParams: (req: TReq) => URLSearchParams, primaryResourceId?: string,
	): Promise<RequestResult<RestGetOneResponse<any>>> {
		const restPath = this._getBasePath(primaryResourceId);
		const { fields, ...rest } = request;
		const keyFields = Object.values(rest).join('/');

		const dedupKey = `GET/${restPath}/${keyFields}/${fields?.join(',')}`;
		// buildSearchParams is the caller's, and knows only the fields it looks records up by.
		// org_id is added by the service layer after that function was written, so it has to be
		// appended here or an org-scoped getOne would go out unscoped.
		const searchParams = buildSearchParams(request);
		const orgId = (request as Record<string, any>).org_id;
		if (orgId != null && !searchParams.has('org_id')) {
			searchParams.append('org_id', String(orgId));
		}
		return this._opts.requestMaker!.get<RestGetOneResponse<any>>(`${restPath}/getOne`, {
			searchParams,
			dedupKey,
		});
	}

	public getModelSchema(primaryResourceId?: string): Promise<RequestResult<RestGetModelSchemaResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		const dedupKey = `GET/${restPath}/meta/schema`;
		return this._opts.requestMaker!.get<RestGetModelSchemaResponse>(`${restPath}/meta/schema`, {
			dedupKey,
		});
	}

	/**
	 * Evaluates one function-kind computed field against a model the user is still editing.
	 *
	 * A read computes these fields from rows that exist; a form needs the same answer before a
	 * save, or a value derived from a field they just changed stays stale until afterwards.
	 */
	public computeField(
		request: RestComputeFieldRequest, fieldName: string, primaryResourceId?: string,
	): Promise<RequestResult<RestComputeFieldResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.post<RestComputeFieldResponse>(
			`${restPath}/meta/compute/${fieldName}`, { json: request });
	}

	public manageM2m(
		request: RestManageM2mRequest, path: string, primaryResourceId?: string,
	): Promise<RequestResult<RestMutateResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.post<RestMutateResponse>(`${restPath}/${path}`, { json: request });
	}

	public search(
		request: RestSearchRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestSearchResponse<any>>> {
		if (request.size === 0) {
			return Promise.resolve<RequestResult<RestSearchResponse<any>>>({
				data: {
					items: [],
					total: 0,
					page: 0,
					size: 0,
					desired_fields: [],
					masked_fields: [],
					schema_etag: '',
				},
				clientErrors: [],
			});
		}
		const restPath = this._getBasePath(primaryResourceId);
		const dedupKey = [
			'GET',
			restPath,
			request.fields?.join(',') ?? '-',
			request.page ?? '-',
			request.size ?? '-',
			request.graph ? JSON.stringify(request.graph) : '-',
			request.language ?? '-',
			// Two orgs asking the same page of the same resource are different queries. Without
			// this they would share one in-flight promise, and whichever asked first would
			// answer for both.
			request.org_id ?? '-',
			// Same reasoning: an archived-inclusive search and an archived-exclusive one differ
			// only by this flag, so leaving it out would collapse them into a single request.
			request.include_archived ? 'archived' : '-',
		];
		return this._opts.requestMaker!.get<RestSearchResponse<any>>(restPath, {
			searchParams: this._toSearchParams(request),
			dedupKey: dedupKey.join('/'),
		});
	}

	public setIsArchived(
		request: RestSetIsArchivedRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestMutateResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker!.post<RestMutateResponse>(`${restPath}/${id}/archived`, { json: body });
	}

	public update(
		request: RestUpdateRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestMutateResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker!.patch<RestMutateResponse>(`${restPath}/${id}`, { json: body });
	}

	private _getBasePath(primaryResourceId?: string): string {
		if (this._opts.primaryResourcePath) {
			if (!primaryResourceId) { throw new Error('primaryResourceId is required'); }
			return `${this._opts.primaryResourcePath}/${primaryResourceId}/${this._opts.resourcePath}`;
		}
		return this._basePath;
	}

	private _toSearchParams(request: Record<string, any>): URLSearchParams {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(request)) {
			if (value == null) continue;
			if (Array.isArray(value)) {
				value.forEach(item => searchParams.append(key, item));
			}
			else if (typeof value === 'object') {
				// throw new Error('Unsupported value type in SearchParams');
				searchParams.append(key, JSON.stringify(value));
			}
			else {
				searchParams.append(key, String(value));
			}
		}
		return searchParams;
	}

}

export type RequestWithFields = {
	fields?: string[],
};

export type RestCreateRequest = Record<string, any>;

export type RestCreateResponse = {
	id: string,
	etag: string,
	created_at: string,
};

export type RestDeleteRequest = {
	id: string,
	/** Scopes the delete to one organization, where the resource is org-owned. */
	org_id?: string,
};

export type RestDeleteResponse = {
	affected_count: number,
	affected_at: string,
};

export type RestExistsRequest = {
	ids: string[],
	/** Scopes the check to one organization, where the resource is org-owned. */
	org_id?: string,
};

export type RestExistsResponse = {
	existing: string[],
	not_existing: string[],
};

export type RestGetByIdRequest = RequestWithFields & {
	id: string,
	/** Scopes the read to one organization, where the resource is org-owned. */
	org_id?: string,
};

type ModelSchemaFieldName = ModelSchema['fields'][string]['name'];

export type RestGetOneMeta<TFieldName extends string = ModelSchemaFieldName> = {
	desired_fields: TFieldName[],
	masked_fields: TFieldName[] | null,
	schema_etag: string,
};

export type RestGetOneResponse<T extends Record<string, any>, TFieldName extends string = ModelSchemaFieldName> = {
	item: T,
	meta: RestGetOneMeta<TFieldName>,
};

export type RestGetModelSchemaResponse = ModelSchema;

export type RestComputeFieldRequest = {
	/** The unsaved model to compute against; the server needs no stored row. */
	model?: Record<string, any>,
	/** Caller-supplied extras the function reads by name. */
	args?: Record<string, any>,
};

export type RestComputeFieldResponse = {
	/** Base data-type name, e.g. "ulid". */
	data_type: string,
	/** Array-ness is a modifier on the base type, so it travels separately from the name. */
	is_array: boolean,
	value: any,
};

export type RestSetIsArchivedRequest = {
	id: string,
	etag: string,
	is_archived: boolean,
};

/**
 * A single condition, as the positional tuple the backend expects.
 * The operator may take more than one value, hence the rest element.
 */
export type SearchCondition = [string, SearchOperator, ...unknown[]]; // i.e: ['field1', '=', 'value1']

/**
 * `if`, `and`, `or` are mutually exclusive.
 * The key is `if`, not `condition`: it must match the backend's JSON tag.
 */
export type SearchGraph = {
	if?: SearchCondition,
	and?: SearchNode[],
	or?: SearchNode[],
	order?: OrderBy, // i.e: [['field1', 'asc'], ['field2', 'desc']]
};

export type OrderBy = Array<[string, SearchOrder]>;

/**
 * `if`, `and`, `or` are mutually exclusive.
 */
export type SearchNode = {
	if?: SearchCondition,
	and?: SearchNode[],
	or?: SearchNode[],
};

export type SearchOperator =
	'='      // Equals
	| '!='   // NotEquals
	| '>'    // GreaterThan
	| '>='   // GreaterEqual
	| '<'    // LessThan
	| '<='   // LessEqual
	| '*'    // Contains
	| '!*'   // NotContains
	| '^'    // StartsWith
	| '!^'   // NotStartsWith
	| '$'    // EndsWith
	| '!$'   // NotEndsWith
	| 'in'   // In
	| 'not_in' // NotIn
	| 'is_set' // IsSet
	| 'not_set' // IsNotSet
	// Linked / NotLinked: only for graph conditions on a many edge (one:many, many:many).
	// Field is the edge name (no dot). Value is the peer / child row primary key to test linkage.
	| 'linked'
	| 'not_linked';

export type SearchOrder = 'asc' | 'desc';

export type RestSearchRequest = RequestWithFields & {
	page?: number,
	size?: number,
	graph?: SearchGraph,
	language?: string,
	search_name?: string,
	/** Scopes the search to one organization, where the resource is org-owned. */
	org_id?: string,
	/**
	 * Returns archived rows alongside active ones. Omitted or false keeps the server's default,
	 * which hides them.
	 *
	 * This is the only correct way to widen a search to archived records: the query builder
	 * injects `is_archived = FALSE` on root queries, and an `is_archived = true` condition in
	 * the graph would return *only* archived rows rather than both. Mirrors the backend's
	 * `SearchQuery.IncludeArchived`.
	 */
	include_archived?: boolean,
};

export type RestSearchResponse<T extends Record<string, any>> = {
	items: Array<T>,
	total: number,
	page: number,
	size: number,
	desired_fields: string[],
	masked_fields: string[],
	schema_etag: string,
};

export type RestUpdateRequest = Record<string, any> & RestMutateOneRequest;

export type RestMutateOneRequest = {
	id: string,
	etag: string,
};

export type RestMutateResponse = {
	affected_count: number,
	affected_at: string,
	etag: string,
};

export type RestManageM2mRequest = Record<string, any> & {
	add?: string[],
	remove?: string[],
};