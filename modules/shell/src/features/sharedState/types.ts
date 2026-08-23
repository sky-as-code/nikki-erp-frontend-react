/**
 * Slice name for the Shell's shared state.
 *
 * Lives on `shellStore` alongside `routing` and `shell.userContext`: this is Shell-owned
 * state, and a micro-app can only reach it through the command bus.
 */
export const SLICE_NAME = 'shell.sharedState';

/**
 * Keyed by **method name**, which is how `createServiceSlice` names its state entries.
 * `setCurrentOrgId` therefore holds the org id, not a nested object.
 */
export type SharedState = {
	setCurrentOrgId: string | null,
	setCurrentModule: string | null,
	setEnvVars: ShellEnvVarBag | null,
};

/**
 * The env vars exactly as `index.html` injected them, left untyped on purpose.
 *
 * The Shell's own `ShellEnvVars` names only the four vars nikkierp itself needs. Deployments add
 * their own — `MAPLIBRE_GL_API_KEY` is a coremart-only `NIKKI_PUBLIC_*` var — and narrowing to the
 * closed type here would drop them in transit, leaving a caller to fall back to a default while
 * the real value sat in `window.__CLIENT_CONFIG__`. Consumers narrow at the read site instead.
 */
export type ShellEnvVarBag = Record<string, unknown>;
