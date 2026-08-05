import { ModuleStore } from './types';


/**
 * Every {@link ModuleStore} in this bundle, keyed by module name.
 *
 * Scope note: a separately-built micro-app bundle gets its own copy of this module,
 * so the registry is per-bundle, not global. That is deliberate — the Shell and a
 * micro-app must not reach each other's state. Cross-boundary data goes through the
 * command bus or the event bus.
 */
class ModuleStoreRegistry {
	readonly #stores = new Map<string, ModuleStore>();

	public register(moduleStore: ModuleStore): void {
		const existing = this.#stores.get(moduleStore.name);
		if (existing && existing !== moduleStore) {
			throw new Error(
				`A module store named '${moduleStore.name}' already exists. `
				+ 'createModuleStore() must be called once per module, at module scope. '
				+ 'A duplicate usually means the module was imported through two different paths.',
			);
		}
		this.#stores.set(moduleStore.name, moduleStore);
	}

	public get(name: string): ModuleStore | undefined {
		return this.#stores.get(name);
	}

	public require(name: string): ModuleStore {
		const found = this.#stores.get(name);
		if (!found) {
			throw new Error(`No module store named '${name}'. Registered: ${this.names().join(', ') || '(none)'}.`);
		}
		return found;
	}

	public has(name: string): boolean {
		return this.#stores.has(name);
	}

	public names(): string[] {
		return [...this.#stores.keys()];
	}

	/** Test-only. Clearing a live registry orphans every mounted Provider. */
	public clear(): void {
		this.#stores.clear();
	}
}

export const moduleStoreRegistry = new ModuleStoreRegistry();
