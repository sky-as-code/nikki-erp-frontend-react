import { RequestMaker } from '../request/request';

import type { ModelSchema } from './model_schema';
import type { SearchGraph } from './searchGraph';
import type { RequestResult } from '../request/request';


export type {
	OrderBy, SearchCondition, SearchGraph, SearchNode, SearchOperator, SearchOrder,
} from './searchGraph';

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

	/** With `files`, one multipart request through the BFF, which uploads them and sets their ids. */
	public create(
		request: RestCreateRequest, primaryResourceId?: string, files?: RestFiles,
	): Promise<RequestResult<RestCreateResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker!.post<RestCreateResponse>(restPath, writeBody(request, files));
	}

	/** `POST {resource}/bulk`: many records under one permission check and one transaction. */
	public createBulk(request: RestBulkCreateRequest): Promise<RequestResult<RestBulkCreateResponse>> {
		const restPath = this._getBasePath();
		return this._opts.requestMaker!.post<RestBulkCreateResponse>(`${restPath}/bulk`, { json: request });
	}

	/**
	 * `POST {resource}/import`: a multipart form of one file plus the column mapping. The org
	 * travels in the query string like on a read, because a form has no JSON body to carry it.
	 */
	public importFile(request: RestImportRequest): Promise<RequestResult<RestBulkCreateResponse>> {
		const restPath = this._getBasePath();
		const form = new FormData();
		form.append('file', request.file, request.file.name);
		form.append('mapping', JSON.stringify(request.mapping));
		return this._opts.requestMaker!.post<RestBulkCreateResponse>(`${restPath}/import`, {
			body: form,
			searchParams: request.org_id ? { org_id: request.org_id } : undefined,
		});
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

	/** With `with_edge_labels`, the BFF's labelled read instead: see {@link getByIdLabelled}. */
	public getById(
		request: RestGetByIdRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestGetOneResponse<any>>> {
		return request.with_edge_labels
			? this.getByIdLabelled(request, primaryResourceId)
			: this._getById(this._getBasePath(primaryResourceId), request);
	}

	/**
	 * `GET /api/v1/detail/{path}/{id}`: the BFF adds the label of every to-one edge to `fields` (default `*`) and
	 * names each edge's label field in `meta.edge_labels`; the added selections are not in `meta.desired_fields`.
	 */
	public getByIdLabelled(
		request: RestGetByIdRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestGetOneResponse<any>>> {
		return this._getById(labelledPath('detail', this._getBasePath(primaryResourceId)), request);
	}

	private _getById(restPath: string, request: RestGetByIdRequest): Promise<RequestResult<RestGetOneResponse<any>>> {
		const { id, with_edge_labels: _labelled, ...rest } = request;
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
	 * `GET {resource}/meta/schema_graph`: this resource's schema and the schema of every resource its
	 * edges point at, gathered by the BFF in one round trip. Only for a top-level resource; a nested
	 * one has no single schema name in its path for the BFF to resolve.
	 */
	public getSchemaGraph(params?: RestGetSchemaGraphRequest): Promise<RequestResult<RestGetSchemaGraphResponse>> {
		const restPath = this._getBasePath();
		return this._opts.requestMaker!.get<RestGetSchemaGraphResponse>(`${restPath}/meta/schema_graph`, {
			searchParams: params?.org_id ? { org_id: params.org_id } : undefined,
			dedupKey: `GET/${restPath}/meta/schema_graph/${params?.org_id ?? ''}`,
		});
	}

	/** Whether {@link getSchemaGraph} can address this resource. */
	public get isTopLevel(): boolean {
		return !this._opts.primaryResourcePath;
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

	/** With `with_edge_labels`, the BFF's labelled list instead: see {@link searchLabelled}. */
	public search(
		request: RestSearchRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestSearchResponse<any>>> {
		return request.with_edge_labels
			? this.searchLabelled(request, primaryResourceId)
			: this._search(this._getBasePath(primaryResourceId), request);
	}

	/**
	 * `GET /api/v1/list/{path}`: the BFF adds the label of every to-one edge whose foreign key the request selects
	 * (base: `fields`, else `default_search_fields`, else `*`) and names each edge's label field in `edge_labels`;
	 * the added selections are not in `desired_fields`.
	 */
	public searchLabelled(
		request: RestSearchRequest, primaryResourceId?: string,
	): Promise<RequestResult<RestSearchResponse<any>>> {
		return this._search(labelledPath('list', this._getBasePath(primaryResourceId)), request);
	}

	private _search(
		restPath: string, { with_edge_labels: _labelled, ...request }: RestSearchRequest,
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

	/** With `files`, one multipart request through the BFF, which uploads them and sets their ids. */
	public update(
		request: RestUpdateRequest, primaryResourceId?: string, files?: RestFiles,
	): Promise<RequestResult<RestMutateResponse>> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker!.patch<RestMutateResponse>(`${restPath}/${id}`, writeBody(body, files));
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

/**
 * `v1/iam/iam_user` → `v1/list/iam/iam_user`: the BFF's labelled read of the same business-service path
 * (`/api/v1/{list|detail}/{path}`).
 */
export function labelledPath(kind: 'list' | 'detail', restPath: string): string {
	const separatorIdx = restPath.indexOf('/');
	if (separatorIdx < 0) {
		return `${kind}/${restPath}`;
	}
	return `${restPath.slice(0, separatorIdx)}/${kind}/${restPath.slice(separatorIdx + 1)}`;
}

/** The BFF's multipart part carrying the JSON body; it must come before the files. */
export const RESOURCE_FORM_PAYLOAD_PART = 'payload';
/** Payload key telling the BFF each file's size, which Storage's quota check needs before the bytes. */
export const RESOURCE_FORM_FILE_SIZES_KEY = '__file_sizes';

/**
 * JSON when no file is chosen; otherwise the BFF's resource form: part `payload` first (the body plus
 * `__file_sizes`), then one part per file named by its `<name>_file_id` field.
 */
function writeBody(body: Record<string, any>, files?: RestFiles): { json: Record<string, any> } | { body: FormData } {
	const entries = Object.entries(files ?? {});
	if (entries.length === 0) {
		return { json: body };
	}
	const sizes = Object.fromEntries(entries.map(([field, file]) => [field, file.size]));
	const form = new FormData();
	form.append(RESOURCE_FORM_PAYLOAD_PART, JSON.stringify({ ...body, [RESOURCE_FORM_FILE_SIZES_KEY]: sizes }));
	entries.forEach(([field, file]) => form.append(field, file, file.name));
	return { body: form };
}

// In `fields`, every readable field of the root record, combinable with edge paths. The backend
// expands it; it is unrelated to the `*` Contains search operator.
export const ALL_FIELDS = '*';

export type RequestWithFields = {
	fields?: string[],
};

export type RestCreateRequest = Record<string, any>;

export type RestCreateResponse = {
	id: string,
	etag: string,
	created_at: string,
};

export type RestBulkCreateRequest = {
	/** Scopes every item to one organization, where the resource is org-owned. */
	org_id?: string,
	items: Record<string, any>[],
};

/** One rejected row of a bulk create or import; `row` is 1-based over the data rows. */
export type RestImportRowError = {
	row: number,
	field?: string,
	/** Translation key under the `common` namespace, e.g. `err_import_reference_not_found`. */
	code: string,
	params?: Record<string, any>,
};

export type RestBulkCreateResponse = {
	affected_count: number,
	created_count: number,
	updated_count: number,
	affected_at: string,
	total_rows: number,
	error_count: number,
	errors: RestImportRowError[],
};

export type RestImportColumnMapping = {
	/** Header text as read from the file. */
	source: string,
	/** Schema field name. The referenced schema of an edge field is derived server-side. */
	target: string,
};

export type RestImportMapping = {
	language_code: string,
	create_missing_references: boolean,
	columns: RestImportColumnMapping[],
};

/** Files chosen for a create or update, keyed by their `<name>_file_id` field. */
export type RestFiles = Record<string, File>;

export type RestImportRequest = {
	file: File,
	mapping: RestImportMapping,
	/** Scopes the import to one organization, where the resource is org-owned. */
	org_id?: string,
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
	/** Client-side only: read through the BFF's `detail/` route, which adds the to-one edge labels. */
	with_edge_labels?: boolean,
};

type ModelSchemaFieldName = ModelSchema['fields'][string]['name'];

export type RestGetOneMeta<TFieldName extends string = ModelSchemaFieldName> = {
	desired_fields: TFieldName[],
	masked_fields: TFieldName[] | null,
	schema_etag: string,
	/** `{<edge>: <label field>}`, set by the BFF's labelled read (`with_edge_labels`). */
	edge_labels?: Record<string, string>,
};

export type RestGetOneResponse<T extends Record<string, any>, TFieldName extends string = ModelSchemaFieldName> = {
	item: T,
	meta: RestGetOneMeta<TFieldName>,
};

export type RestGetModelSchemaResponse = ModelSchema;

export type RestGetSchemaGraphRequest = {
	org_id?: string,
};

export type RestGetSchemaGraphResponse = {
	schema: ModelSchema,
	/** Keyed by the target schema's name; one entry per distinct edge target. */
	edges: Record<string, ModelSchema>,
};

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
	/** Client-side only: search through the BFF's `list/` route, which adds the to-one edge labels. */
	with_edge_labels?: boolean,
};

export type RestSearchResponse<T extends Record<string, any>> = {
	items: Array<T>,
	total: number,
	page: number,
	size: number,
	desired_fields: string[],
	masked_fields: string[],
	schema_etag: string,
	/** `{<edge>: <label field>}`, set by the BFF's labelled read (`with_edge_labels`). */
	edge_labels?: Record<string, string>,
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