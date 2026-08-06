import { collectMethodKinds } from './methodDecorators';
import {
	CreateServiceSliceOptions, ModuleStore, ServiceMethodThunk, ServiceSlice, SyncActionCreator,
} from './types';


/** Marks a bound instance method so `useServiceLayer` can identify it from a bare reference. */
const STORE_METHOD_TAG = Symbol.for('@nikkierp/ui:storeMethodTag');

export type StoreMethodTag = {
	methodName: string,
	sliceName: string,
	moduleName: string,
	/** Set for a `@storeAsyncMethod`; `undefined` for a sync one. */
	thunk?: ServiceMethodThunk,
	/** Set for a `@storeSyncMethod`; `undefined` for an async one. */
	syncAction?: SyncActionCreator,
};

/** Class → slice, so `selectSliceState` can resolve a class it was not given a thunk for. */
const slicesByClass = new WeakMap<object, ServiceSlice>();

/**
 * Class → slice name, recorded at decoration time.
 *
 * The slice itself only exists once the service is instantiated, but a selector may be
 * created before that. The name is known as soon as the decorator runs, so this map lets
 * `selectSliceState` resolve without waiting for the first `new`.
 */
const sliceNamesByClass = new WeakMap<object, string>();

export function getServiceSlice(serviceClass: object): ServiceSlice | undefined {
	return slicesByClass.get(serviceClass);
}

export function getServiceSliceName(serviceClass: object): string | undefined {
	return sliceNamesByClass.get(serviceClass);
}

export function readStoreMethodTag(method: unknown): StoreMethodTag | undefined {
	if (typeof method !== 'function') return undefined;
	return (method as any)[STORE_METHOD_TAG] as StoreMethodTag | undefined;
}

/**
 * Turns a service class into a Redux slice named `sliceName` on `moduleStore`.
 *
 * Every method found on the prototype chain — including those inherited from a base
 * class such as `CrudServiceBase` — becomes a thunk plus the reducer cases maintaining
 * `state[methodName]`. There is no per-method decorator: a subclass that declares no
 * methods of its own still gets the full inherited set.
 *
 * ```ts
 * @storeService('UserService', identityStore)
 * export class UserService extends CrudServiceBase { }
 * ```
 *
 * `sliceName` is given by the caller rather than read off `ServiceClass.name`: a
 * minifier renames the class, and two services collapsing to one mangled name would
 * silently share a slice.
 *
 * The slice is built on the first instantiation rather than at class-definition time,
 * because the generated thunks call their methods on a real instance. Services are
 * module-scope singletons (`export const userService = new UserService()`), so this is
 * still import time.
 */
export function storeService<TClass extends abstract new (...args: any[]) => any>(
	sliceName: string,
	moduleStore: ModuleStore,
	options: CreateServiceSliceOptions = {},
) {
	// Validate here, not on first `new`: a blank name is a programmer error, and throwing
	// at decoration time surfaces it at import rather than at first use.
	if (!sliceName) {
		throw new Error('@storeService requires an explicit slice name as its first argument.');
	}

	return function decorate(target: TClass, context: ClassDecoratorContext): TClass {
		if (context.kind !== 'class') {
			throw new Error('@storeService may only decorate a class.');
		}

		const methodNames = Object.keys(collectMethodKinds(target));
		let slice: ServiceSlice | undefined;

		sliceNamesByClass.set(target, sliceName);

		/**
		 * Installs bound, tagged copies of every method on the instance.
		 *
		 * Two services inheriting `getById` share one prototype function object, so a
		 * bare `userService.getById` reference could not otherwise say which slice it
		 * belongs to. Binding also preserves `this`, which `#private` field reads need.
		 */
		function tagInstance(instance: any): void {
			// A second `new` of the same class must not rebuild the slice.
			if (!slice) {
				slice = moduleStore.createServiceSlice(target as any, instance, { ...options, sliceName });
				// Key both bindings: the declared name resolves to the subclass returned
				// below, while anything captured earlier still points at the original.
				slicesByClass.set(target, slice);
				slicesByClass.set(instance.constructor, slice);
			}

			for (const methodName of methodNames) {
				const original = instance[methodName];
				if (typeof original !== 'function') continue;
				const bound = original.bind(instance);
				const tag: StoreMethodTag = {
					methodName,
					sliceName: slice.name,
					moduleName: moduleStore.name,
					// Exactly one of these is set, per the method's annotation.
					thunk: slice.thunks[methodName],
					syncAction: slice.syncActions[methodName],
				};
				Object.defineProperty(bound, STORE_METHOD_TAG, { value: tag, enumerable: false });
				Object.defineProperty(instance, methodName, { value: bound, writable: true, configurable: true });
			}
		}

		// A class decorator's addInitializer runs with `this` bound to the constructor,
		// not to an instance, so the tagging has to happen per `new` instead. Subclassing
		// the target is the only hook that sees each instance after its fields are set.
		const Decorated = class extends (target as any) {
			public constructor(...args: any[]) {
				super(...args);
				tagInstance(this);
			}
		};

		sliceNamesByClass.set(Decorated, sliceName);

		// Only for stack traces and devtools — the slice name is `sliceName`, which is a
		// literal and so survives minification where `target.name` would not.
		Object.defineProperty(Decorated, 'name', { value: sliceName, configurable: true });

		return Decorated as unknown as TClass;
	};
}
