import { readStoreMethodTag } from './decorators';
import { moduleStoreRegistry } from './moduleStoreRegistry';
import { ModuleStore } from './types';


/**
 * The module store registered under `name`, or a throw naming what *is* registered.
 *
 * A thin alias for the registry's own lookup, kept for discoverability: reaching through
 * a registry singleton is a less obvious spelling of "get the Shell's store". A missing
 * store is always a bug, so this never returns `undefined` — a nullable flavour would
 * only invite `getModuleStore('shell')?.dispatch(...)` defensiveness.
 */
export function getModuleStore(name: string): ModuleStore {
	return moduleStoreRegistry.require(name);
}

/**
 * Dispatches a `@storeService` method through its own module's store, outside React.
 *
 * ```ts
 * const { data } = await dispatchServiceMethod<ServiceResult<User>>(userService.getById, { id });
 * ```
 *
 * The non-React twin of `useServiceLayer`, for command-bus handlers, service-to-service
 * calls and bootstrap steps. The signature matches the hook's deliberately: a
 * multi-argument method takes its params as an **array**, a single-argument one takes the
 * value directly.
 *
 * **Calling `userService.getById(...)` directly dispatches nothing.** `@storeService`
 * installs a *bound copy of the plain method* on each instance and hangs the thunk off it
 * as metadata; the function itself never reaches the store. The direct call still returns
 * the right data, which is what makes the omission so easy to miss — it fails only in
 * that no slice is written, so nothing observing that method's state re-renders.
 *
 * The owning module is resolved from the method's own tag rather than passed in: the
 * method already knows which store owns it, so letting a caller name a different one
 * could only ever be a mistake. That is also what makes this reusable as-is from any
 * module — an identity service resolves to the identity store, a Shell service to the
 * Shell store, with no extra argument.
 *
 * Three things to know before typing the result:
 *
 * - `TResult` is an assertion, not an inference. The thunk flattens a
 *   `{data, clientErrors}` envelope on the way through, so what resolves carries
 *   `SerializedClientError[]` — plain JSON, not the `ClientErrorItem` instances the
 *   method returned. Declaring the method's own return type would be wrong on exactly
 *   the error path, so the default is `unknown` and narrowing is the caller's call.
 * - A `@storeSyncMethod` resolves to the params it was dispatched with, **not** the state
 *   its reducer computed: the method runs inside the reducer, so its return value only
 *   ever reaches the store. Read that back with a selector or `getState()`.
 * - A method that throws rejects this promise with the message alone. The thunk
 *   serializes the error to a string so it can ride in an action, so neither the original
 *   class nor its stack survives the round trip.
 */
export async function dispatchServiceMethod<TResult = unknown>(
	method: (...args: any[]) => any,
	params?: unknown,
): Promise<TResult> {
	const tag = readStoreMethodTag(method);
	if (!tag) {
		throw new Error(
			'dispatchServiceMethod() needs a method from a @storeService class instance, '
			+ 'e.g. dispatchServiceMethod(userService.getById, params). '
			+ 'Passing UserService.prototype.getById or a detached function will not work.',
		);
	}

	const { dispatch } = getModuleStore(tag.moduleName);

	// Resolved rather than returned bare, so both kinds of method are awaited the same
	// way: whether a method is sync or async is the service's business, not its caller's.
	if (tag.syncAction) {
		return dispatch(tag.syncAction(params)).payload as TResult;
	}

	// Exactly one of thunk/syncAction is set, per the method's annotation.
	return await (dispatch(tag.thunk!(params) as any) as any).unwrap() as TResult;
}
