import { describe, expect, it } from 'vitest';

import { collectServiceMethods } from './collectServiceMethods';


/** Mirrors the real `CrudServiceBase` surface, including its protected internals. */
abstract class FakeCrudBase {
	public create(_request: any) { return null; }
	public update(_request: any) { return null; }
	public delete(_request: any) { return null; }
	public setIsArchived(_request: any) { return null; }
	public manageM2m(_request: any, _path: string) { return null; }
	public getById(_request: any) { return null; }
	public getOne(_request: any, _build: () => any) { return null; }
	public search(_request: any) { return null; }
	public exists(_request: any) { return null; }
	public getModelSchema() { return null; }

	// `protected` is erased at runtime, so the walk must exclude these by name.
	protected withSchema(_fn: any) { return null; }
	protected emitEvent(_action: string, _fn: any) { return null; }
}

class FakeUserService extends FakeCrudBase {}

class FakeOrgService extends FakeCrudBase {
	public getBySlug(_request: any) { return null; }
	public manageUsers(_request: any) { return null; }
}


describe('collectServiceMethods', () => {
	it('collects every inherited method for a subclass declaring none of its own', () => {
		const methods = collectServiceMethods(FakeUserService);

		expect(methods.sort()).toEqual([
			'create', 'delete', 'exists', 'getById', 'getModelSchema',
			'getOne', 'manageM2m', 'search', 'setIsArchived', 'update',
		]);
	});

	it('collects a subclass own methods alongside the inherited ones', () => {
		const methods = collectServiceMethods(FakeOrgService);

		expect(methods).toHaveLength(12);
		expect(methods).toContain('getBySlug');
		expect(methods).toContain('manageUsers');
		expect(methods).toContain('getById');
	});

	it('excludes the deny-listed internals from every class', () => {
		for (const cls of [FakeUserService, FakeOrgService]) {
			const methods = collectServiceMethods(cls);
			expect(methods).not.toContain('withSchema');
			expect(methods).not.toContain('emitEvent');
		}
	});

	it('excludes the constructor and Object.prototype members', () => {
		const methods = collectServiceMethods(FakeUserService);

		expect(methods).not.toContain('constructor');
		expect(methods).not.toContain('hasOwnProperty');
		expect(methods).not.toContain('toString');
	});

	it('does not invoke prototype getters', () => {
		let invoked = false;
		class WithGetter {
			public get trap() {
				invoked = true;
				return 1;
			}
			public real() { return null; }
		}

		const methods = collectServiceMethods(WithGetter);

		expect(invoked).toBe(false);
		expect(methods).toEqual(['real']);
	});

	it('reports an overridden method once', () => {
		class Base {
			public search(_request: any) { return 'base'; }
		}
		class Sub extends Base {
			public override search(_request: any) { return 'sub'; }
		}

		expect(collectServiceMethods(Sub)).toEqual(['search']);
	});

	it('returns an empty list for a class with no prototype methods', () => {
		class Empty {}

		expect(collectServiceMethods(Empty)).toEqual([]);
	});
});
