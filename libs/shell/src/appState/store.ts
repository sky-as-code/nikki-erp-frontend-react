import { RegisterReducerFn } from '@nikkierp/ui/microApp';
import { combineReducers, configureStore } from '@reduxjs/toolkit';


/**
 * The legacy default-context store — a **compatibility shim**, not Shell state.
 *
 * Every Shell slice (`auth`, `userContext`, `shellConfig`, `erpModules`, `routing`) now
 * lives on `shellStore`, on its own react-redux context. What is left here exists only
 * for micro-apps that still call `registerReducer` in their `init` and read through
 * `MicroAppStateProvider`. Do not add Shell state to it.
 *
 * It disappears once those modules move to their own `createModuleStore` — see
 * ai-prompts/app-state/00-progress.md, APPST-010.
 */

/** RTK rejects an empty reducer map, so the store starts with this placeholder. */
const PLACEHOLDER_KEY = '__shellStoreShim';

function placeholderReducer(state: boolean = true): boolean {
	return state;
}

const lazyReducers: Record<string, any> = {};

function createRootReducer() {
	return combineReducers({
		[PLACEHOLDER_KEY]: placeholderReducer,
		...lazyReducers,
	});
}

export const store = configureStore({
	reducer: createRootReducer(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function injectReducer(key: string, reducer: any) {
	if (lazyReducers[key]) return; // skip duplicates
	lazyReducers[key] = reducer;
	store.replaceReducer(createRootReducer());
}

export function registerReducerFactory(slug: string) {
	return function registerReducer(reducer: any) {
		injectReducer(slug, reducer);
		return {
			dispatch: store.dispatch,
			selectMicroAppState: () => {
				const state = store.getState() as any;
				return state[slug];
			},
			selectRootState: () => {
				const state = store.getState() as any;
				return state;
			},
		};
	} as RegisterReducerFn;
}
