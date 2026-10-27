import { resolveModuleKey } from './module_key_resolver';

import type { SchemaCache } from '../../common/cache/schema_cache';
import type { UpstreamClient } from '../../common/http/upstream_client';
import type { IncomingMessage } from 'node:http';


const DEFAULT_CONCURRENCY = 6;

export interface SchemaGraphRequest {
	readonly moduleKey: string;
	readonly schemaName: string;
	/** Raw query string without `?` (e.g. `org_id=1`), forwarded to every upstream call. */
	readonly query: string;
	readonly accessToken?: string;
	readonly incomingReq?: IncomingMessage;
}

export interface SchemaGraphBody {
	readonly schema: unknown;
	/** Edge target schemas keyed by schema name. */
	readonly edges: Record<string, unknown>;
	/** Edge targets whose schema could not be fetched; they are absent from `edges`. */
	readonly failed_edges: string[];
}

export interface SchemaGraphResult {
	readonly status: number;
	/** `SchemaGraphBody` on 200; the upstream body as-is when the root schema fetch failed. */
	readonly body: unknown;
}

export interface SchemaGraphService {
	/**
	 * Rejects with `UpstreamUnavailableError` only when the root schema cannot be fetched. Schemas and complete
	 * graphs (no `failed_edges`) come from the shared cache, keyed by `{module}/{schema}` only: the business
	 * service's `meta/schema` answer is the same for every authenticated caller and query.
	 */
	fetchGraph(request: SchemaGraphRequest): Promise<SchemaGraphResult>;
}

export type EdgeTarget = { readonly schemaName: string; readonly moduleKey?: string };

type SchemaRelation = { readonly dest_schema_name?: unknown; readonly module_key?: unknown };


type GraphDeps = {
	readonly upstream: UpstreamClient;
	readonly cache: SchemaCache;
	readonly concurrency: number;
};

export function createSchemaGraphService(
	upstream: UpstreamClient, cache: SchemaCache, concurrency: number = DEFAULT_CONCURRENCY,
): SchemaGraphService {
	const deps: GraphDeps = { upstream, cache, concurrency };
	return {
		fetchGraph: (request) => cache.getOrLoad(
			`graph:${request.moduleKey}/${request.schemaName}`, () => loadGraph(deps, request), isCompleteGraph,
		),
	};
}

async function loadGraph(deps: GraphDeps, request: SchemaGraphRequest): Promise<SchemaGraphResult> {
	const root = await fetchSchema(deps, request, request.moduleKey, request.schemaName);
	if (!isSuccess(root.status)) {
		return root;
	}
	const edges: Record<string, unknown> = {};
	const failedEdges: string[] = [];
	await mapWithConcurrency(collectEdgeTargets(root.body, request), deps.concurrency, async (target) => {
		const edge = await fetchEdgeSchema(deps, request, target);
		if (edge === undefined) {
			failedEdges.push(target.schemaName);
			return;
		}
		edges[target.schemaName] = edge;
	});
	const body: SchemaGraphBody = { schema: root.body, edges, failed_edges: failedEdges.sort() };
	return { status: 200, body };
}

function isCompleteGraph(result: SchemaGraphResult): boolean {
	return result.status === 200 && (result.body as SchemaGraphBody).failed_edges.length === 0;
}

function fetchSchema(
	deps: GraphDeps, request: SchemaGraphRequest, moduleKey: string, schemaName: string,
): Promise<SchemaGraphResult> {
	const load = async (): Promise<SchemaGraphResult> => {
		const query = request.query ? `?${request.query}` : '';
		const path = `/v1/${encodeURIComponent(moduleKey)}/${encodeURIComponent(schemaName)}/meta/schema${query}`;
		const response = await deps.upstream.requestJson('GET', path, {
			accessToken: request.accessToken,
			incomingReq: request.incomingReq,
		});
		return { status: response.status, body: response.body };
	};
	return deps.cache.getOrLoad(`schema:${moduleKey}/${schemaName}`, load, isSchemaResult);
}

function isSchemaResult(result: SchemaGraphResult): boolean {
	return isSuccess(result.status) && isObject(result.body);
}

/** An edge schema, or undefined when it cannot be fetched for any reason (no module key, status, network). */
async function fetchEdgeSchema(
	deps: GraphDeps, request: SchemaGraphRequest, target: EdgeTarget,
): Promise<unknown> {
	if (!target.moduleKey) {
		return undefined;
	}
	try {
		const result = await fetchSchema(deps, request, target.moduleKey, target.schemaName);
		return isSuccess(result.status) && isObject(result.body) ? result.body : undefined;
	}
	catch {
		return undefined;
	}
}

/**
 * Distinct destination schemas of every relation, outgoing (`to_relations`) and incoming (`from_relations`),
 * excluding the root itself.
 */
export function collectEdgeTargets(
	schema: unknown, root: Pick<SchemaGraphRequest, 'moduleKey' | 'schemaName'>,
): EdgeTarget[] {
	if (!isObject(schema)) {
		return [];
	}
	const relations = [...asArray(schema.to_relations), ...asArray(schema.from_relations)];
	const targets = new Map<string, EdgeTarget>();
	for (const relation of relations.filter(isObject) as SchemaRelation[]) {
		const schemaName = relation.dest_schema_name;
		if (typeof schemaName !== 'string' || schemaName === '' || schemaName === root.schemaName) {
			continue;
		}
		if (!targets.has(schemaName)) {
			const moduleKey = resolveModuleKey(schemaName, {
				explicitModuleKey: relation.module_key,
				rootModuleKey: root.moduleKey,
				rootSchemaName: root.schemaName,
			});
			targets.set(schemaName, { schemaName, moduleKey });
		}
	}
	return [...targets.values()];
}

export async function mapWithConcurrency<T>(
	items: readonly T[], limit: number, worker: (item: T) => Promise<void>,
): Promise<void> {
	let next = 0;
	async function drain(): Promise<void> {
		while (next < items.length) {
			const item = items[next++];
			await worker(item);
		}
	}
	const laneCount = Math.max(1, Math.min(limit, items.length));
	await Promise.all(Array.from({ length: laneCount }, () => drain()));
}

function isSuccess(status: number): boolean {
	return status >= 200 && status < 300;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}
