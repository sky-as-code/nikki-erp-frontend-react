/**
 * The Shell's routing slice.
 *
 * Keys are the **method names** on `RoutingService`, because that is how
 * `createServiceSlice` names its state entries — one per annotated method. A
 * `@storeSyncMethod` stores its return value bare, with no request envelope, so each
 * entry is the value itself.
 */
export type RoutingState = {
	resetCurrentPath: string,
	setReturnTo: string | null,
	setActiveOrg: string | null,
	setActiveModule: string | null,
};

/** The same state under domain names, which is what callers actually want to read. */
export type ActiveRoutingContext = {
	currentPath: string,
	returnTo: string | null,
	activeOrg: string | null,
	activeModule: string | null,
};
