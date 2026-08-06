import React from 'react';

import { readStoreMethodTag } from './decorators';
import { useModuleDispatch, useModuleSelector } from './ModuleStoreProvider';
import { ServiceLayerResult, ServiceMethodState } from './types';


/** Never dispatched: what the hook reports before the slice has any entry. */
const emptyMethodState: ServiceMethodState = {
	status: null,
	data: null,
	clientErrors: [],
	error: null,
	doneAt: 0,
};

/**
 * Normalises what the slice holds into a {@link ServiceMethodState}.
 *
 * A sync method stores its return value bare, with no envelope, so it is presented as a
 * settled state — callers then read `data` the same way for both kinds.
 */
function readMethodState<TData>(stored: unknown, isSync: boolean): ServiceMethodState<TData> {
	if (isSync) {
		return { ...emptyMethodState, status: 'fulfilled', data: (stored ?? null) as TData | null };
	}
	return (stored ?? emptyMethodState) as ServiceMethodState<TData>;
}

export type UseServiceLayerOptions = {
	/**
	 * Dispatch once on mount, and again whenever `params` changes by value.
	 *
	 * Off by default: `params` is usually a fresh object literal each render, so
	 * dispatching on reference identity would loop forever. Comparison is by
	 * `JSON.stringify`, not by reference.
	 */
	dispatchOnMount?: boolean,
};

export type UseServiceLayerReturn<TData = any> = {
	/** Dispatches the method's thunk. Pass params to override the ones given to the hook. */
	dispatchMethod: (overrideParams?: any) => any,
	/** The method's request state, with the status expanded into booleans. */
	result: ServiceLayerResult<TData>,
	/** Shorthand for `result.data`. */
	data: TData | null,
};

/**
 * Dispatches a service method through its module's store and reads back its state.
 *
 * ```ts
 * const { dispatchMethod, result, data } = useServiceLayer(userService.getById, { id });
 * ```
 *
 * The method must come from an instance of a `@storeService` class and be annotated
 * `@storeAsyncMethod` or `@storeSyncMethod` — `@storeService` installs bound, tagged
 * copies on each instance, which is what makes a bare `userService.getById` reference
 * resolvable to its thunk. A sync method reports as permanently `fulfilled`, since it
 * has no pending or rejected state to report.
 *
 * Note `isSuccess`, not `isFulfilled`, is the usual success test: a call that returns
 * client errors completed, so it is fulfilled but not successful.
 */
export function useServiceLayer<TData = any>(
	method: (...args: any[]) => any,
	params?: any,
	options: UseServiceLayerOptions = {},
): UseServiceLayerReturn<TData> {
	const tag = readStoreMethodTag(method);
	if (!tag) {
		throw new Error(
			'useServiceLayer() needs a method from a @storeService class instance, '
			+ 'e.g. useServiceLayer(userService.getById, params). '
			+ 'Passing UserService.prototype.getById or a detached function will not work.',
		);
	}

	const dispatch = useModuleDispatch();
	const { thunk, syncAction, sliceName, methodName } = tag;
	// Exactly one is set, per the method's annotation, so this picks the right dispatcher.
	const action = (thunk ?? syncAction)!;

	const dispatchMethod = React.useCallback(
		(overrideParams?: any) => dispatch(action(overrideParams === undefined ? params : overrideParams) as any),
		[dispatch, action, params],
	);

	const methodState = useModuleSelector(
		(state: any) => readMethodState<TData>(state?.[sliceName]?.[methodName], Boolean(syncAction)),
	);

	// Compare by value: a caller passing an object literal would otherwise re-dispatch every render.
	const { dispatchOnMount = false } = options;
	const paramsKey = dispatchOnMount ? JSON.stringify(params ?? null) : null;
	const latestParams = React.useRef(params);
	latestParams.current = params;

	React.useEffect(() => {
		if (!dispatchOnMount) return;
		dispatch(action(latestParams.current) as any);
	}, [dispatch, action, paramsKey, dispatchOnMount]);

	const result = React.useMemo<ServiceLayerResult<TData>>(() => {
		const isFulfilled = methodState.status === 'fulfilled';
		return {
			isPending: methodState.status === 'pending',
			isFulfilled,
			// Completed *and* clean. A validation rejection is fulfilled but not successful.
			isSuccess: isFulfilled && methodState.clientErrors.length === 0,
			isRejected: methodState.status === 'rejected',
			error: methodState.error,
			clientErrors: methodState.clientErrors,
			data: methodState.data,
			doneAt: methodState.doneAt,
		};
	}, [methodState]);

	return React.useMemo(
		() => ({ dispatchMethod, result, data: result.data }),
		[dispatchMethod, result],
	);
}
