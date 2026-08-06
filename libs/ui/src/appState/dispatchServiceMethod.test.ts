import { ClientErrorItem } from '@nikkierp/common/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { storeService } from './decorators';
import { dispatchServiceMethod, getModuleStore } from './dispatchServiceMethod';
import { storeAsyncMethod, storeSyncMethod } from './methodDecorators';
import { createModuleStore } from './moduleStore';
import { moduleStoreRegistry } from './moduleStoreRegistry';
import { selectSliceState } from './selectSliceState';


afterEach(() => {
	moduleStoreRegistry.clear();
	vi.restoreAllMocks();
});

function buildService(store: ReturnType<typeof createModuleStore>) {
	@storeService('Sample', store)
	class Sample {
		readonly #secret = 'private-ok';

		@storeAsyncMethod
		public async one(request: { id: string }) {
			return { data: { id: request.id, secret: this.#secret }, clientErrors: [] };
		}

		@storeAsyncMethod
		public async twoArgs(first: string, second: string) {
			return { data: `${first}:${second}`, clientErrors: [] };
		}

		@storeAsyncMethod
		public async failing() {
			return {
				data: null,
				clientErrors: [new ClientErrorItem({
					type: 'validation', field: 'name', key: 'name_required', message: 'Name is required',
				})],
			};
		}

		@storeAsyncMethod
		public async throwing() {
			throw new Error('network down');
		}

		@storeAsyncMethod
		public async bare() {
			return 'no-envelope';
		}

		@storeSyncMethod
		public setActiveOrg(slug: string | null) { return slug; }

		public helper() { return 'not-in-store'; }
	}

	return { Sample, service: new Sample() };
}


describe('getModuleStore', () => {
	it('returns the store registered under the name', () => {
		const store = createModuleStore('alpha');

		expect(getModuleStore('alpha')).toBe(store);
	});

	it('throws for an unknown name, listing what is registered', () => {
		createModuleStore('alpha');

		expect(() => getModuleStore('missing')).toThrow(/alpha/);
	});
});


describe('dispatchServiceMethod', () => {
	it('writes the slice — the whole point, versus calling the method directly', async () => {
		const store = createModuleStore('alpha');
		const { Sample, service } = buildService(store);

		// The direct call runs the body and returns the right data...
		await expect((service as any).one({ id: 'u1' })).resolves.toMatchObject({
			data: { id: 'u1' },
		});
		// ...but records nothing. This is the failure mode that blanked the Shell.
		expect((selectSliceState(Sample)(store.getState()) as any).one.status).toBeNull();

		await dispatchServiceMethod(service.one, { id: 'u2' });

		const state = selectSliceState(Sample)(store.getState()) as any;
		expect(state.one.status).toBe('fulfilled');
		expect(state.one.data).toEqual({ id: 'u2', secret: 'private-ok' });
	});

	it('resolves the unwrapped payload', async () => {
		const store = createModuleStore('alpha');
		const { service } = buildService(store);

		await expect(dispatchServiceMethod(service.one, { id: 'u1' })).resolves.toEqual({
			data: { id: 'u1', secret: 'private-ok' },
			clientErrors: [],
		});
	});

	it('passes a non-envelope return value straight through', async () => {
		const store = createModuleStore('alpha');
		const { service } = buildService(store);

		await expect(dispatchServiceMethod(service.bare)).resolves.toBe('no-envelope');
	});

	it('spreads an array argument across a multi-parameter method', async () => {
		const store = createModuleStore('alpha');
		const { Sample, service } = buildService(store);

		await dispatchServiceMethod(service.twoArgs, ['a', 'b']);

		expect((selectSliceState(Sample)(store.getState()) as any).twoArgs.data).toBe('a:b');
	});

	it('resolves — not rejects — when the call returns client errors', async () => {
		const store = createModuleStore('alpha');
		const { Sample, service } = buildService(store);

		// The server answered and said no. That is a completed call.
		const result = await dispatchServiceMethod<{ clientErrors: unknown[] }>(service.failing);

		expect(result.clientErrors).toEqual([
			{ key: 'name_required', message: 'Name is required', type: 'validation', field: 'name' },
		]);
		expect((selectSliceState(Sample)(store.getState()) as any).failing.status).toBe('fulfilled');
	});

	it('rejects with the message when the method throws', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const store = createModuleStore('alpha');
		const { Sample, service } = buildService(store);

		await expect(dispatchServiceMethod(service.throwing)).rejects.toThrow('network down');

		expect((selectSliceState(Sample)(store.getState()) as any).throwing.status).toBe('rejected');
		expect(consoleError).toHaveBeenCalled();
	});

	it('dispatches a sync method and resolves to the params it was given', async () => {
		const store = createModuleStore('alpha');
		const { service } = buildService(store);

		// Documented asymmetry: a sync method's own return value reaches the store, not
		// the caller, because it runs inside the reducer.
		await expect(dispatchServiceMethod(service.setActiveOrg, 'acme')).resolves.toBe('acme');
		expect((store.getState().Sample as any).setActiveOrg).toBe('acme');
	});

	it('rejects a method that carries no store tag', async () => {
		const store = createModuleStore('alpha');
		const { service } = buildService(store);

		await expect(dispatchServiceMethod(service.helper))
			.rejects.toThrow(/needs a method from a @storeService class instance/);
		await expect(dispatchServiceMethod(() => 'detached'))
			.rejects.toThrow(/needs a method from a @storeService class instance/);
	});

	it('rejects when the owning module store is gone', async () => {
		const store = createModuleStore('alpha');
		const { service } = buildService(store);

		moduleStoreRegistry.clear();

		await expect(dispatchServiceMethod(service.one, { id: 'u1' })).rejects.toThrow(/alpha/);
	});
});
