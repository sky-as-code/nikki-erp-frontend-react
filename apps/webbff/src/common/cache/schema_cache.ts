/**
 * In-memory TTL cache with in-flight de-duplication. A rejected load, or a value `isCacheable` refuses, is never
 * stored, so the next caller loads again.
 */
export interface SchemaCache {
	/**
	 * The cached value of `key`, else the result of `load`. Concurrent callers of a missing key share one load;
	 * a caller that joined a load whose outcome is not cacheable runs its own `load` instead (the outcome may be
	 * specific to the first caller, e.g. its expired token).
	 */
	getOrLoad<T>(key: string, load: () => Promise<T>, isCacheable?: (value: T) => boolean): Promise<T>;
	clear(): void;
}

export interface SchemaCacheOptions {
	readonly ttlMs: number;
	/** Milliseconds since the epoch; injectable for tests. */
	readonly now?: () => number;
}

type Entry = { readonly value: unknown; readonly expiresAt: number };

export function createSchemaCache(options: SchemaCacheOptions): SchemaCache {
	const now = options.now ?? Date.now;
	const entries = new Map<string, Entry>();
	const inFlight = new Map<string, Promise<{ value: unknown; cacheable: boolean }>>();

	function store(key: string, value: unknown): void {
		entries.set(key, { value, expiresAt: now() + options.ttlMs });
	}

	async function loadAlone<T>(key: string, load: () => Promise<T>, isCacheable: (value: T) => boolean): Promise<T> {
		const value = await load();
		if (isCacheable(value)) {
			store(key, value);
		}
		return value;
	}

	async function getOrLoad<T>(
		key: string, load: () => Promise<T>, isCacheable: (value: T) => boolean = () => true,
	): Promise<T> {
		const entry = entries.get(key);
		if (entry && entry.expiresAt > now()) {
			return entry.value as T;
		}
		entries.delete(key);
		const pending = inFlight.get(key);
		if (pending) {
			const shared = await pending.catch(() => undefined);
			return shared?.cacheable ? shared.value as T : loadAlone(key, load, isCacheable);
		}
		const loading = load().then((value) => ({ value: value as unknown, cacheable: isCacheable(value) }));
		inFlight.set(key, loading);
		try {
			const outcome = await loading;
			if (outcome.cacheable) {
				store(key, outcome.value);
			}
			return outcome.value as T;
		}
		finally {
			inFlight.delete(key);
		}
	}

	return {
		getOrLoad,
		clear: () => entries.clear(),
	};
}
