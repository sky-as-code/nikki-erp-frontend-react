import { getServiceSlice } from './decorators';
import { resolveSliceName } from './serviceSlice';
import { ServiceClass, ServiceSliceState } from './types';


type SliceSelector<TInstance> = (state: any) => ServiceSliceState<TInstance>;

/**
 * One selector per class, so `createSelector` memoization survives repeated calls.
 * A fresh input selector each time would defeat it entirely.
 */
const selectorsByClass = new WeakMap<object, SliceSelector<any>>();

/**
 * Selects a service's slice state from its module store.
 *
 * ```ts
 * const selectUsername = createSelector(
 *     selectSliceState(UserService),
 *     state => state.getById.data?.username,
 * );
 * ```
 *
 * The returned state is typed with every member of the class. That is deliberately
 * loose: members that did not become thunks — non-methods, and the deny-listed
 * internals — are `undefined` at runtime despite what the type says.
 */
export function selectSliceState<TClass extends ServiceClass>(
	serviceClass: TClass,
): SliceSelector<InstanceType<TClass>> {
	const cached = selectorsByClass.get(serviceClass);
	if (cached) return cached;

	const selector: SliceSelector<InstanceType<TClass>> = (state: any) => {
		// Resolved lazily: the slice exists only once the service has been instantiated,
		// which may happen after this selector is created.
		const sliceName = getServiceSlice(serviceClass)?.name ?? resolveSliceName(serviceClass);
		return state?.[sliceName];
	};

	selectorsByClass.set(serviceClass, selector);
	return selector;
}
