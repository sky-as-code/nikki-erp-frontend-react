import { RequestMaker } from '../request/request';

import type { ModelSchema } from './model_schema';


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

	public create(request: RestCreateRequest, primaryResourceId?: string): Promise<RestCreateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.post<RestCreateResponse>(restPath, { json: request });
	}

	public delete(request: RestDeleteRequest, primaryResourceId?: string): Promise<RestDeleteResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.delete<RestDeleteResponse>(`${restPath}/${request.id}`, { searchParams: request });
	}

	public exists(request: RestExistsRequest): Promise<RestExistsResponse> {
		const restPath = this._getBasePath();
		return this._opts.requestMaker!.post<RestExistsResponse>(restPath + '/exists', {
			searchParams: this._toSearchParams(request),
		});
	}

	public getById(request: RestGetByIdRequest, primaryResourceId?: string): Promise<RestGetOneResponse<any>> {
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
	): Promise<RestGetOneResponse<any>> {
		const restPath = this._getBasePath(primaryResourceId);
		const { fields, ...rest } = request;
		const keyFields = Object.values(rest).join('/');

		const dedupKey = `GET/${restPath}/${keyFields}/${fields?.join(',')}`;
		return this._opts.requestMaker!.get<RestGetOneResponse<any>>(`${restPath}/getOne`, {
			searchParams: buildSearchParams(request),
			dedupKey,
		});
	}

	public getModelSchema(primaryResourceId?: string): Promise<RestGetModelSchemaResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		const dedupKey = `GET/${restPath}/meta/schema`;
		return this._opts.requestMaker!.get<RestGetModelSchemaResponse>(`${restPath}/meta/schema`, {
			dedupKey,
		});
	}

	public manageM2m(
		request: RestManageM2mRequest, path: string, primaryResourceId?: string,
	): Promise<RestMutateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.post<RestMutateResponse>(`${restPath}/${path}`, { json: request });
	}

	public search(request: RestSearchRequest, primaryResourceId?: string): Promise<RestSearchResponse<any>> {
		if (request.size === 0) {
			return Promise.resolve<RestSearchResponse<any>>({
				items: [],
				total: 0,
				page: 0,
				size: 0,
				desired_fields: [],
				masked_fields: [],
				schema_etag: '',
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
		];
		return this._opts.requestMaker!.get<RestSearchResponse<any>>(restPath, {
			searchParams: this._toSearchParams(request),
			dedupKey: dedupKey.join('/'),
		});
	}

	public setIsArchived(request: RestSetIsArchivedRequest, primaryResourceId?: string): Promise<RestMutateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker!.post<RestMutateResponse>(`${restPath}/${id}/archived`, { json: body });
	}

	public update(request: RestUpdateRequest, primaryResourceId?: string): Promise<RestMutateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker!.patch<RestMutateResponse>(`${restPath}/${id}`, { json: body });
	}

	private _getBasePath(primaryResourceId?: string): string {
		if (this._opts.primaryResourcePath) {
			if (primaryResourceId) { throw new Error('primaryResourceId is required'); }
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
};

export type RestDeleteResponse = {
	affected_count: number,
	affected_at: string,
};

export type RestExistsRequest = {
	ids: string[],
};

export type RestExistsResponse = {
	existing: string[],
	not_existing: string[],
};

export type RestGetByIdRequest = RequestWithFields & {
	id: string,
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