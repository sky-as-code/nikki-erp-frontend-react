/**
 * Schema prefixes that differ from the business service module key in the resource path. Mirrors the frontend
 * micro-app registry, where a micro-app declares `schemaPrefix` only when its schemas are not named `{slug}_*`.
 */
const PREFIX_MODULE_KEYS: Readonly<Record<string, string>> = { vdmc: 'vendingmachine' };

export interface ModuleKeyHint {
	/** The module key the business service names for the schema, when it names one (it does not today). */
	readonly explicitModuleKey?: unknown;
	/** The root resource the graph was requested for. */
	readonly rootModuleKey?: string;
	readonly rootSchemaName?: string;
}

/** The `{prefix}` of a `{prefix}_{entity}` schema name, undefined when the name has no prefix. */
export function schemaPrefix(schemaName: string): string | undefined {
	const separatorIdx = schemaName.indexOf('_');
	return separatorIdx > 0 ? schemaName.slice(0, separatorIdx) : undefined;
}

/**
 * The module key under which `/v1/{module}/{schema}` serves `schemaName`, in order of trust: an explicit key from
 * the schema JSON, the root's own module when both schemas share a prefix, the static prefix map, then the prefix.
 */
export function resolveModuleKey(schemaName: string, hint: ModuleKeyHint = {}): string | undefined {
	if (typeof hint.explicitModuleKey === 'string' && hint.explicitModuleKey !== '') {
		return hint.explicitModuleKey;
	}
	const prefix = schemaPrefix(schemaName);
	if (!prefix) {
		return undefined;
	}
	if (hint.rootModuleKey && hint.rootSchemaName && schemaPrefix(hint.rootSchemaName) === prefix) {
		return hint.rootModuleKey;
	}
	return PREFIX_MODULE_KEYS[prefix] ?? prefix;
}
