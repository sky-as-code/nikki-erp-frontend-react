import { describe, expect, it } from 'vitest';

import { collectMethodKinds, storeAsyncMethod, storeSyncMethod } from './methodDecorators';


/** Mirrors the real `StoreCrudServiceBase`: annotated operations plus unannotated internals. */
abstract class FakeCrudBase {
	@storeAsyncMethod
	public create(_request: any) { return null; }

	@storeAsyncMethod
	public search(_request: any) { return null; }

	// `protected` is erased at runtime, but an unannotated method is excluded anyway.
	protected withSchema(_fn: any) { return null; }
	protected emitEvent(_action: string, _fn: any) { return null; }
}

class FakeUserService extends FakeCrudBase {}

class FakeOrgService extends FakeCrudBase {
	@storeAsyncMethod
	public getBySlug(_request: any) { return null; }

	@storeSyncMethod
	public setActiveOrg(_slug: string) { return null; }
}


describe('collectMethodKinds', () => {
	it('collects inherited annotations for a subclass declaring none of its own', () => {
		expect(collectMethodKinds(FakeUserService)).toEqual({ create: 'async', search: 'async' });
	});

	it('collects a subclass own annotations alongside the inherited ones', () => {
		expect(collectMethodKinds(FakeOrgService)).toEqual({
			create: 'async', search: 'async', getBySlug: 'async', setActiveOrg: 'sync',
		});
	});

	it('excludes every unannotated method', () => {
		for (const cls of [FakeUserService, FakeOrgService]) {
			const keys = Object.keys(collectMethodKinds(cls));
			expect(keys).not.toContain('withSchema');
			expect(keys).not.toContain('emitEvent');
		}
	});

	it('excludes the constructor and Object.prototype members', () => {
		// Compare own keys: `toHaveProperty` walks the prototype chain, so every plain
		// object would report `hasOwnProperty` regardless of what was collected.
		expect(Object.keys(collectMethodKinds(FakeUserService)).sort()).toEqual(['create', 'search']);
	});

	it('does not invoke prototype getters', () => {
		let invoked = false;
		class WithGetter {
			public get trap() {
				invoked = true;
				return 1;
			}

			@storeAsyncMethod
			public real() { return null; }
		}

		expect(collectMethodKinds(WithGetter)).toEqual({ real: 'async' });
		expect(invoked).toBe(false);
	});

	it('lets a subclass override change the kind of an inherited method', () => {
		class Base {
			@storeAsyncMethod
			public value(_request: any) { return null; }
		}
		class Sub extends Base {
			@storeSyncMethod
			public override value(_request: any) { return null; }
		}

		expect(collectMethodKinds(Sub)).toEqual({ value: 'sync' });
	});

	it('returns nothing for a class with no annotated methods', () => {
		class Empty {
			public plain() { return null; }
		}

		expect(collectMethodKinds(Empty)).toEqual({});
	});
});


describe('decorator misuse', () => {
	it('rejects a static method', () => {
		expect(() => {
			class Bad {
				@storeAsyncMethod
				public static nope() { return null; }
			}
			return Bad;
		}).toThrow(/may not be applied to a static method/);
	});
});
