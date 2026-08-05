/**
 * Members that live on a service prototype but are not service operations.
 *
 * `withSchema` and `emitEvent` are `protected` in TypeScript, which is a compile-time
 * fiction: at runtime they are ordinary prototype methods and the walk below finds them.
 * A genuinely private helper should use a `#private` method, which is invisible to
 * `Object.getOwnPropertyNames` and needs no entry here.
 */
const DENIED_METHODS: ReadonlySet<string> = new Set(['withSchema', 'emitEvent']);


/**
 * Every method a service class exposes, walking the prototype chain so that methods
 * inherited from a base class (`CrudServiceBase`) are included.
 *
 * This replaces a per-method decorator: a subclass declaring no methods of its own still
 * gets the full set of its base's operations, which is the point.
 *
 * Order is prototype-first, so a subclass override is reported once, from the subclass.
 */
export function collectServiceMethods(serviceClass: { prototype: any }): string[] {
	const names = new Set<string>();
	let proto = serviceClass.prototype;

	// Stop at Object.prototype, never at null, so `toString` and friends stay out.
	while (proto && proto !== Object.prototype) {
		for (const key of Object.getOwnPropertyNames(proto)) {
			if (key === 'constructor' || DENIED_METHODS.has(key)) continue;
			// Read the descriptor rather than `proto[key]`: indexing would invoke a getter,
			// and an accessor cannot become a thunk anyway.
			const descriptor = Object.getOwnPropertyDescriptor(proto, key);
			if (descriptor && typeof descriptor.value === 'function') {
				names.add(key);
			}
		}
		proto = Object.getPrototypeOf(proto);
	}

	return [...names];
}
