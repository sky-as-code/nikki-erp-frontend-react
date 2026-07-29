import type { IViewRegistry } from './IViewEngine';


/** Engine API level implemented by this package. */
export const VIEW_ENGINE_API_VERSION = 1;

export type ViewKitContext = {
	/** Host-declared engine API level. Kits assert compatibility against it. */
	readonly engineApiVersion: number,
	/** Free-form host flags (theme, locale, feature toggles). */
	readonly hostInfo: Readonly<Record<string, unknown>>,
};

/**
 * A bundle of contributions installed with `engine.use(kit)`. A kit ships as a
 * single exported factory (e.g. `contributeMantineViewKit(engine)`) so the set
 * of things it registers is one reviewable list, not a pile of import side
 * effects scattered across the package.
 */
export interface IViewKit {
	/** Namespaced, e.g. `nikkierp.mantine`, `acme.crm`. */
	readonly id: string;
	readonly version: string;
	/** Engine API levels this kit supports, e.g. `[1]`. */
	readonly engineApiVersions: readonly number[];
	contribute(registry: IViewRegistry, ctx: ViewKitContext): void;
}
