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
};
