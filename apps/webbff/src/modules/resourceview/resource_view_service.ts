import { ALL_FIELDS, defaultListFields, withEdgeLabelFields } from './edge_label_fields';
import { resolveModuleKey } from '../dynamicresource/module_key_resolver';

import type { EdgeLabelSelection, ViewSchema } from './edge_label_fields';
import type { UpstreamClient } from '../../common/http/upstream_client';
import type { SchemaGraphBody, SchemaGraphService } from '../dynamicresource/schema_graph_service';
import type { IncomingMessage } from 'node:http';


export type ResourceViewKind = 'list' | 'detail';

/** A business-service resource path, as the browser named it after `/api/v1/{list|detail}/`. */
export interface ResourceViewTarget {
	readonly kind: ResourceViewKind;
	/** The path segments after `/v1/`, e.g. `['iam', 'iam_user']` or `['iam', 'iam_user', '<id>']`. */
	readonly segments: readonly string[];
	/** Module key and schema name of the resource read: the last schema segment of a nested path. */
	readonly moduleKey: string;
	readonly schemaName: string;
}

export interface ResourceViewRequest {
	readonly target: ResourceViewTarget;
	readonly query: URLSearchParams;
	readonly accessToken: string;
	readonly incomingReq?: IncomingMessage;
}

export interface ResourceViewResult {
	readonly status: number;
	readonly body: unknown;
}

export interface ResourceViewService {
	/** Rejects with `UpstreamUnavailableError` when the business service cannot be reached. */
	read(request: ResourceViewRequest): Promise<ResourceViewResult>;
}

const SCHEMA_SEGMENT = /^[a-z0-9_]+$/;
const ID_SEGMENT = /^[A-Za-z0-9_-]+$/;
const NO_SELECTION: EdgeLabelSelection = Object.freeze({ fields: [], added: [], edgeLabels: {} });

/**
 * Validates `segments` (`{module}/{schema}` or `{module}/{primary}/{id}/{sub}`, plus `/{id}` for a detail) and
 * resolves the schema read. Undefined for any other shape or segment (dot segments, encoded slashes, upper case).
 */
export function parseResourceViewPath(
	kind: ResourceViewKind, segments: readonly string[],
): ResourceViewTarget | undefined {
	const resourceLength = kind === 'detail' ? segments.length - 1 : segments.length;
	if (resourceLength !== 2 && resourceLength !== 4) {
		return undefined;
	}
	const valid = segments.every((segment, index) => {
		const isIdSlot = index === 2 || index === resourceLength;
		return (isIdSlot ? ID_SEGMENT : SCHEMA_SEGMENT).test(segment);
	});
	if (!valid) {
		return undefined;
	}
	const [moduleKey, primarySchema] = segments;
	if (resourceLength === 2) {
		return { kind, segments, moduleKey, schemaName: primarySchema };
	}
	const schemaName = segments[3];
	const subModuleKey = resolveModuleKey(schemaName, { rootModuleKey: moduleKey, rootSchemaName: primarySchema });
	return { kind, segments, moduleKey: subModuleKey ?? moduleKey, schemaName };
}

export function createResourceViewService(
	upstream: UpstreamClient, graphs: SchemaGraphService,
): ResourceViewService {
	return {
		read: (request) => read(upstream, graphs, request),
	};
}

async function read(
	upstream: UpstreamClient, graphs: SchemaGraphService, request: ResourceViewRequest,
): Promise<ResourceViewResult> {
	const selection = await selectEdgeLabels(graphs, request);
	const query = new URLSearchParams(request.query);
	if (selection.added.length > 0) {
		query.delete('fields');
		selection.fields.forEach((field) => query.append('fields', field));
	}
	const search = query.toString();
	const path = `/v1/${request.target.segments.map(encodeURIComponent).join('/')}${search ? `?${search}` : ''}`;
	const response = await upstream.requestJson('GET', path, {
		accessToken: request.accessToken,
		incomingReq: request.incomingReq,
	});
	if (response.status < 200 || response.status >= 300 || !isObject(response.body)) {
		return { status: response.status, body: response.body };
	}
	return { status: response.status, body: decorate(request.target.kind, response.body, selection) };
}

/**
 * The edge label selections for this read. A schema graph that cannot be had (a nested resource the business service
 * serves no top-level `meta/schema` for, a refusal) leaves the read as the browser sent it, without labels.
 */
async function selectEdgeLabels(graphs: SchemaGraphService, request: ResourceViewRequest): Promise<EdgeLabelSelection> {
	const orgId = request.query.get('org_id');
	const graph = await graphs.fetchGraph({
		moduleKey: request.target.moduleKey,
		schemaName: request.target.schemaName,
		query: orgId ? new URLSearchParams({ org_id: orgId }).toString() : '',
		accessToken: request.accessToken,
		incomingReq: request.incomingReq,
	});
	const body = graph.body as Partial<SchemaGraphBody> | undefined;
	if (graph.status !== 200 || !isObject(body) || !isObject(body.schema)) {
		return NO_SELECTION;
	}
	const schema = body.schema as ViewSchema;
	// The graph does not repeat the root under `edges`, so a self edge (`parent_location`) resolves to the root schema.
	const edges = {
		[request.target.schemaName]: schema,
		...(isObject(body.edges) ? body.edges : {}),
	} as Record<string, ViewSchema>;
	const requested = request.query.getAll('fields').filter((field) => field !== '');
	const base = requested.length > 0 ? requested : defaultBase(request.target.kind, schema);
	return withEdgeLabelFields(base, schema, edges);
}

function defaultBase(kind: ResourceViewKind, schema: ViewSchema): string[] {
	return kind === 'list' ? defaultListFields(schema) : [ALL_FIELDS];
}

/**
 * The answer as the browser asked for it: the added selections leave `desired_fields` (a masked one stays in
 * `masked_fields`, which is how the browser learns the edge is locked), and `edge_labels` names each edge's label
 * field — top level on a list, in `meta` on a detail.
 */
function decorate(
	kind: ResourceViewKind, body: Record<string, unknown>, selection: EdgeLabelSelection,
): Record<string, unknown> {
	if (kind === 'list') {
		return { ...stripAdded(body, selection.added), edge_labels: selection.edgeLabels };
	}
	const meta = isObject(body.meta) ? body.meta : {};
	return { ...body, meta: { ...stripAdded(meta, selection.added), edge_labels: selection.edgeLabels } };
}

function stripAdded(holder: Record<string, unknown>, added: readonly string[]): Record<string, unknown> {
	if (added.length === 0 || !Array.isArray(holder.desired_fields)) {
		return holder;
	}
	const extra = new Set(added);
	return { ...holder, desired_fields: holder.desired_fields.filter((field) => !extra.has(field as string)) };
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
