import { RegisterReducerFn } from '@nikkierp/ui/stateManagement';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import * as auth from '../features/auth/authSlice';
import * as userContext from '../features/auth/userContextSlice';


const localReducers = {
	[auth.SLICE_NAME]: auth.reducer,
	[userContext.SLICE_NAME]: userContext.reducer,
};
const lazyReducers: Record<string, any> = {};

function createRootReducer() {
	return combineReducers({ ...localReducers, ...lazyReducers });
}

export const store = configureStore({
	reducer: createRootReducer(),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
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

