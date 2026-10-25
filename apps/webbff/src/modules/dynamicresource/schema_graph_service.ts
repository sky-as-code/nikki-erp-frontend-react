import { resolveModuleKey } from './module_key_resolver';

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
	/** Rejects with `UpstreamUnavailableError` only when the root schema cannot be fetched. */
	fetchGraph(request: SchemaGraphRequest): Promise<SchemaGraphResult>;
}

export type EdgeTarget = { readonly schemaName: string; readonly moduleKey?: string };

type SchemaRelation = { readonly dest_schema_name?: unknown; readonly module_key?: unknown };


export function createSchemaGraphService(
	upstream: UpstreamClient, concurrency: number = DEFAULT_CONCURRENCY,
): SchemaGraphService {
	return {
		fetchGraph: (request) => fetchGraph(upstream, concurrency, request),
	};
}

async function fetchGraph(
	upstream: UpstreamClient, concurrency: number, request: SchemaGraphRequest,
): Promise<SchemaGraphResult> {
	const root = await fetchSchema(upstream, request, request.moduleKey, request.schemaName);
	if (!isSuccess(root.status)) {
		return root;
	}
	const edges: Record<string, unknown> = {};
	const failedEdges: string[] = [];
	await mapWithConcurrency(collectEdgeTargets(root.body, request), concurrency, async (target) => {
		const edge = await fetchEdgeSchema(upstream, request, target);
		if (edge === undefined) {
			failedEdges.push(target.schemaName);
			return;
		}
		edges[target.schemaName] = edge;
	});
	const body: SchemaGraphBody = { schema: root.body, edges, failed_edges: failedEdges.sort() };
	return { status: 200, body };
}

async function fetchSchema(
	upstream: UpstreamClient, request: SchemaGraphRequest, moduleKey: string, schemaName: string,
): Promise<SchemaGraphResult> {
	const query = request.query ? `?${request.query}` : '';
	const path = `/v1/${encodeURIComponent(moduleKey)}/${encodeURIComponent(schemaName)}/meta/schema${query}`;
	const response = await upstream.requestJson('GET', path, {
		accessToken: request.accessToken,
		incomingReq: request.incomingReq,
	});
	return { status: response.status, body: response.body };
}

/** An edge schema, or undefined when it cannot be fetched for any reason (no module key, status, network). */
async function fetchEdgeSchema(
	upstream: UpstreamClient, request: SchemaGraphRequest, target: EdgeTarget,
): Promise<unknown> {
	if (!target.moduleKey) {
		return undefined;
	}
	try {
		const result = await fetchSchema(upstream, request, target.moduleKey, target.schemaName);
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
