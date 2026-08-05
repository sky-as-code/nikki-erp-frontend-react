import { ClientErrorItem } from '@nikkierp/common/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getServiceSlice, readStoreMethodTag, storeService } from './decorators';
import { createModuleStore } from './moduleStore';
import { moduleStoreRegistry } from './moduleStoreRegistry';
import { selectSliceState } from './selectSliceState';


afterEach(() => {
	moduleStoreRegistry.clear();
	vi.restoreAllMocks();
});


describe('moduleStoreRegistry', () => {
	it('registers a store on creation and looks it up by name', () => {
		const store = createModuleStore('alpha');

		expect(moduleStoreRegistry.get('alpha')).toBe(store);
		expect(moduleStoreRegistry.require('alpha')).toBe(store);
		expect(moduleStoreRegistry.has('alpha')).toBe(true);
		expect(moduleStoreRegistry.names()).toEqual(['alpha']);
	});

	it('returns the existing store when the module scope re-executes', () => {
		const first = createModuleStore('alpha');
		const second = createModuleStore('alpha');

		expect(second).toBe(first);
	});

	it('throws for an unknown name, listing what is registered', () => {
		createModuleStore('alpha');

		expect(() => moduleStoreRegistry.require('missing')).toThrow(/alpha/);
	});

	it('rejects an empty module name', () => {
		expect(() => createModuleStore('')).toThrow(/needs a name/);
	});
});


describe('injectSliceReducer', () => {
	it('throws rather than silently merging two slices of the same name', () => {
		const store = createModuleStore('alpha');
		const reducer = (state: any = {}) => state;

		store.injectSliceReducer('Dup', reducer);

		expect(() => store.injectSliceReducer('Dup', reducer)).toThrow(/already has a slice named 'Dup'/);
	});
});


describe('createServiceSlice via @storeService', () => {
	function buildService(store: ReturnType<typeof createModuleStore>) {
		abstract class Base {
			readonly #secret = 'private-ok';

			public async inherited(request: { id: string }) {
				// Reading a #private field throws unless `this` survives the dispatch.
				return { data: { id: request.id, secret: this.#secret }, clientErrors: [] };
			}

			protected withSchema() { return null; }
		}

		@storeService(store)
		class SampleService extends Base {
			public async own(request: { name: string }) {
				return { data: { name: request.name }, clientErrors: [] };
			}

			public async failing() {
				return {
					data: null,
					clientErrors: [new ClientErrorItem({
						type: 'validation', field: 'name', key: 'name_required', message: 'Name is required',
					})],
				};
			}

			public async twoArgs(first: string, second: string) {
				return { data: `${first}:${second}`, clientErrors: [] };
			}

			public async throwing() {
				throw new Error('network down');
			}
		}

		const service = new SampleService();
		// The slice exists only after the first instantiation, hence the accessor.
		const slice = () => getServiceSlice(SampleService)!;
		return { SampleService, service, slice };
	}

	/**
	 * Dispatches the way `useServiceLayer` does: resolve the thunk from the bound
	 * method's tag. Calling `service.method(...)` directly would invoke the service
	 * itself, not the thunk.
	 */
	function dispatchVia(store: ReturnType<typeof createModuleStore>, method: unknown, params?: any) {
		const tag = readStoreMethodTag(method);
		if (!tag) throw new Error('method carries no store tag');
		return store.dispatch(tag.thunk(params) as any);
	}

	it('creates a slice named after the class, with a state key per method', () => {
		const store = createModuleStore('alpha');
		buildService(store);

		const state = store.getState().SampleService as Record<string, unknown>;
		expect(state).toBeDefined();
		expect(Object.keys(state).sort()).toEqual(['failing', 'inherited', 'own', 'throwing', 'twoArgs']);
	});

	it('does not create a slice key for deny-listed internals', () => {
		const store = createModuleStore('alpha');
		buildService(store);

		expect(store.getState().SampleService).not.toHaveProperty('withSchema');
	});

	it('writes the unwrapped payload on success and preserves `this`', async () => {
		const store = createModuleStore('alpha');
		const { SampleService, service } = buildService(store);

		await dispatchVia(store, (service as any).inherited, { id: 'u1' });

		const state = selectSliceState(SampleService)(store.getState()) as any;
		expect(state.inherited.status).toBe('fulfilled');
		expect(state.inherited.data).toEqual({ id: 'u1', secret: 'private-ok' });
		expect(state.inherited.clientErrors).toEqual([]);
		expect(state.inherited.error).toBeNull();
		expect(state.inherited.doneAt).toBeGreaterThan(0);
	});

	it('starts every method in the never-dispatched state', () => {
		const store = createModuleStore('alpha');
		const { SampleService } = buildService(store);

		const state = selectSliceState(SampleService)(store.getState()) as any;
		expect(state.own).toEqual({ status: null, data: null, clientErrors: [], error: null, doneAt: 0 });
	});

	it('spreads an array argument across a multi-parameter method', async () => {
		const store = createModuleStore('alpha');
		const { SampleService, service } = buildService(store);

		await dispatchVia(store, (service as any).twoArgs, ['a', 'b']);

		const state = selectSliceState(SampleService)(store.getState()) as any;
		expect(state.twoArgs.data).toBe('a:b');
	});

	it('treats client errors as a completed call and serializes them', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const store = createModuleStore('alpha');
		const { SampleService, service } = buildService(store);

		await dispatchVia(store, (service as any).failing);

		const state = selectSliceState(SampleService)(store.getState()) as any;
		// The server answered — it just said no. That is a fulfilled call, not a rejected one.
		expect(state.failing.status).toBe('fulfilled');
		expect(state.failing.clientErrors).toEqual([
			{ key: 'name_required', message: 'Name is required', type: 'validation', field: 'name' },
		]);
		// `error` is for technical failures only, and stays clear here.
		expect(state.failing.error).toBeNull();
		expect(state.failing.doneAt).toBeGreaterThan(0);

		// The real guard: no Error instance anywhere in the tree.
		const whole = store.getState();
		expect(JSON.parse(JSON.stringify(whole))).toEqual(whole);
		// Nothing threw, so the thunk's catch never ran and serializableCheck never fired.
		expect(consoleError).not.toHaveBeenCalled();
	});

	it('rejects with a message string when the method throws', async () => {
		// The thunk logs the cause before rejecting; silence it for the test.
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const store = createModuleStore('alpha');
		const { SampleService, service } = buildService(store);

		await dispatchVia(store, (service as any).throwing);

		const state = selectSliceState(SampleService)(store.getState()) as any;
		expect(state.throwing.status).toBe('rejected');
		expect(state.throwing.error).toBe('network down');
		expect(state.throwing.clientErrors).toEqual([]);
		expect(state.throwing.data).toBeNull();
		expect(state.throwing.doneAt).toBeGreaterThan(0);
		expect(consoleError).toHaveBeenCalled();

		const whole = store.getState();
		expect(JSON.parse(JSON.stringify(whole))).toEqual(whole);
	});

	it('resets a method back to its initial state', async () => {
		const store = createModuleStore('alpha');
		const { SampleService, service, slice } = buildService(store);

		await dispatchVia(store, (service as any).own, { name: 'x' });
		store.dispatch(slice().resetActions.own() as any);

		const state = selectSliceState(SampleService)(store.getState()) as any;
		expect(state.own).toEqual({ status: null, data: null, clientErrors: [], error: null, doneAt: 0 });
	});

	it('builds the slice once no matter how many instances exist', () => {
		const store = createModuleStore('alpha');
		const { SampleService } = buildService(store);

		expect(() => new (SampleService as any)()).not.toThrow();
	});
});


describe('selectSliceState', () => {
	it('returns the same selector for the same class', () => {
		const store = createModuleStore('alpha');

		@storeService(store)
		class Repeated {
			public async ping() { return { data: 'pong', clientErrors: [] }; }
		}
		new Repeated();

		expect(selectSliceState(Repeated)).toBe(selectSliceState(Repeated));
	});
});
