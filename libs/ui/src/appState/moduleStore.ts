import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { moduleStoreRegistry } from './moduleStoreRegistry';
import { createServiceSlice } from './serviceSlice';
import { CreateServiceSliceOptions, ModuleStore, ServiceClass } from './types';

import type { Reducer } from '@reduxjs/toolkit';


/** RTK rejects an empty reducer map, so a new store starts with this placeholder. */
const PLACEHOLDER_KEY = '__moduleStore';

function placeholderReducer(state: boolean = true): boolean {
	return state;
}

/**
 * Creates a Redux store owned by one module, and registers it under `name`.
 *
 * The Shell and each micro-app get their own store: no shared state, no shared
 * instance. Anything that must cross that boundary goes through the command bus or
 * the event bus.
 *
 * Call this at module scope — `@storeService` runs at import time and needs the store
 * to already exist:
 *
 * ```ts
 * export const identityStore = createModuleStore('identity');
 * ```
 */
export function createModuleStore(name: string): ModuleStore {
	if (!name) {
		throw new Error('A module store needs a name: the micro-app slug, or "shell" for the Shell.');
	}

	// Vite re-executes module scope on HMR; reuse rather than tripping the duplicate guard.
	const existing = moduleStoreRegistry.get(name);
	if (existing) return existing;

	const sliceReducers: Record<string, Reducer> = { [PLACEHOLDER_KEY]: placeholderReducer };

	function rootReducer() {
		return combineReducers(sliceReducers);
	}

	const store = configureStore({
		reducer: rootReducer(),
		devTools: { name: `module:${name}` },
		middleware: getDefaultMiddleware => getDefaultMiddleware({
			// `getOne` takes a callback, so a thunk argument may legitimately hold a function.
			// Everything reaching the state tree is still checked.
			serializableCheck: { ignoredActionPaths: ['meta.arg'] },
		}),
	});

	const moduleStore: ModuleStore = {
		name,
		store,
		dispatch: store.dispatch,
		getState: () => store.getState() as Record<string, unknown>,

		injectSliceReducer(sliceName: string, reducer: Reducer): void {
			if (sliceReducers[sliceName]) {
				// Never skip silently: merging two services' state would be a data-corruption bug.
				throw new Error(
					`Module store '${name}' already has a slice named '${sliceName}'. `
					+ 'Two @storeService classes passed the same slice name — give each one a distinct name.',
				);
			}
			sliceReducers[sliceName] = reducer;
			store.replaceReducer(rootReducer());
		},

		hasSlice(sliceName: string): boolean {
			return Boolean(sliceReducers[sliceName]);
		},

		createServiceSlice<TInstance>(
			serviceClass: ServiceClass<TInstance>,
			instance: TInstance,
			options?: CreateServiceSliceOptions,
		) {
			return createServiceSlice(moduleStore, serviceClass, instance, options);
		},
	};

	moduleStoreRegistry.register(moduleStore);
	return moduleStore;
}
