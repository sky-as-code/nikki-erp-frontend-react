import {
	IMenuRegistry, MenuConflictError, MenuContribution, MenuRegisterOptions, MenuRegistryManifest,
} from './types';


/**
 * Host-owned menu registry.
 *
 * Deliberately an instance, never a module singleton: a separately-built micro-app
 * bundle gets its own copy of any module it imports, so a singleton `Map` here would
 * be invisible to the Shell. Consumers must reach it through `HostServices` — never
 * by calling {@link createMenuRegistry} themselves.
 *
 * Registration is keyed by micro-app slug and is *permanent*: `MicroAppManager` caches
 * `init()` once per slug, so a module that unregistered on unmount could never
 * re-register. `unregister` exists for tests, devtools and a future hot-unload path.
 */
export class MenuRegistry implements IMenuRegistry {
	readonly #menus = new Map<string, MenuContribution>();
	readonly #listeners = new Set<() => void>();

	public register(contribution: MenuContribution, opts?: MenuRegisterOptions): void {
		const slug = contribution?.slug;
		if (!slug) {
			throw new Error('MenuRegistry.register requires a non-empty slug.');
		}
		const existing = this.#menus.get(slug);
		if (existing && !opts?.override) {
			throw new MenuConflictError(slug);
		}
		if (existing) {
			console.warn(`[menuRegistry] Menu for "${slug}" overridden.`);
		}
		// Frozen so `getMenu` keeps returning a stable reference for useSyncExternalStore.
		this.#menus.set(slug, Object.freeze({ ...contribution }));
		this.#emit();
	}

	public unregister(slug: string): void {
		if (this.#menus.delete(slug)) {
			this.#emit();
		}
	}

	public getMenu(slug?: string | null): MenuContribution | undefined {
		return slug ? this.#menus.get(slug) : undefined;
	}

	/**
	 * An arrow property, not a method: `useSyncExternalStore` resubscribes on every
	 * render unless the `subscribe` reference is stable.
	 */
	public subscribe = (listener: () => void): () => void => {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	};

	public describe(): MenuRegistryManifest {
		const modules = Array.from(this.#menus.values()).map(menu => ({
			slug: menu.slug,
			translationNs: menu.translationNs,
			itemCount: menu.items.length,
		}));
		return { modules };
	}

	#emit(): void {
		this.#listeners.forEach(listener => listener());
	}
}

export function createMenuRegistry(): IMenuRegistry {
	return new MenuRegistry();
}
