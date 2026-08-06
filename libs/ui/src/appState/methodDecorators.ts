import { ServiceMethodKind } from './types';


/**
 * Method function → dispatch kind, populated at class-definition time.
 *
 * Keyed by the function object rather than by the class: a TC39 method decorator runs
 * before the class binding exists and is handed the method itself, which is the very
 * same object that ends up on the prototype. Looking it up during a prototype walk is
 * therefore enough, and needs no instantiation — `@storeService` builds the slice from
 * the class alone, before any `new`.
 */
const kindsByMethod = new WeakMap<object, ServiceMethodKind>();

/** Shared by both decorators; `label` only shapes the error message. */
function decorateWith(kind: ServiceMethodKind, label: string) {
	return function decorate(target: any, context: ClassMethodDecoratorContext): void {
		if (context.kind !== 'method') {
			throw new Error(`@${label} may only decorate a method.`);
		}
		if (context.static) {
			throw new Error(`@${label} may not be applied to a static method.`);
		}
		kindsByMethod.set(target, kind);
	};
}

/**
 * Marks a method as an async service operation.
 *
 * It becomes a `createAsyncThunk` plus the pending / fulfilled / rejected reducer cases
 * maintaining `state[methodName]` as a `{status, data, clientErrors, error, doneAt}`
 * envelope. Every CRUD operation is one of these.
 */
export const storeAsyncMethod = decorateWith('async', 'storeAsyncMethod');

/**
 * Marks a method as a synchronous state update.
 *
 * Its return value replaces `state[methodName]` through a plain reducer case — no
 * promise, no rejection path, no envelope. Use it for what would otherwise be a
 * `createSlice` reducer, such as `setActiveOrg(slug)`.
 */
export const storeSyncMethod = decorateWith('sync', 'storeSyncMethod');

/**
 * The dispatch kind of every annotated method on a service class, walking the prototype
 * chain so annotations inherited from a base class are included.
 *
 * Only annotated methods appear: an undecorated method gets no thunk and no state key,
 * which is what lets a service keep ordinary helpers as ordinary helpers.
 *
 * The walk is prototype-first, so a subclass override wins over the base's annotation.
 */
export function collectMethodKinds(serviceClass: { prototype: any }): Record<string, ServiceMethodKind> {
	const kinds: Record<string, ServiceMethodKind> = {};
	let proto = serviceClass.prototype;

	while (proto && proto !== Object.prototype) {
		for (const key of Object.getOwnPropertyNames(proto)) {
			if (key === 'constructor' || key in kinds) continue;
			// Read the descriptor rather than indexing: indexing would invoke a getter, and
			// an accessor cannot carry an annotation anyway.
			const descriptor = Object.getOwnPropertyDescriptor(proto, key);
			if (!descriptor || typeof descriptor.value !== 'function') continue;
			const kind = kindsByMethod.get(descriptor.value);
			if (kind) kinds[key] = kind;
		}
		proto = Object.getPrototypeOf(proto);
	}

	return kinds;
}
