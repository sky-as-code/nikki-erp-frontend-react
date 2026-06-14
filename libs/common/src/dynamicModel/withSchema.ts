import { schemaRegistry, SchemaPack } from './schema_registry';


/** Reads `schema_etag` from REST get-one (`meta`) or search (top-level) responses. */
export function extractSchemaEtag(data: unknown): string | undefined {
	if (data == null || typeof data !== 'object') return undefined;
	const record = data as Record<string, unknown>;
	if (typeof record.schema_etag === 'string') return record.schema_etag;
	const meta = record.meta;
	if (meta != null && typeof meta === 'object' && typeof (meta as Record<string, unknown>).schema_etag === 'string') {
		return (meta as Record<string, unknown>).schema_etag as string;
	}
	return undefined;
}

/**
 * Resolves a registered schema, runs `fn`, then refreshes the registry when the
 * response `schema_etag` differs from the cached `modelSchema.etag`.
 */
export async function withSchema<TData>(
	schemaName: string,
	fn: (schema: SchemaPack) => Promise<TData>,
): Promise<TData> {
	const schema = await schemaRegistry.get(schemaName);
	if (!schema) {
		throw new Error(`Schema "${schemaName}" is not registered.`);
	}
	const data = await fn(schema);
	const responseEtag = extractSchemaEtag(data);
	if (responseEtag && responseEtag !== schema.modelSchema.etag) {
		await schemaRegistry.refresh(schemaName);
	}
	return data;
}
