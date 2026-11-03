import type { ModelSchema } from './model_schema';
import type { SearchGraph } from './searchGraph';


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