import * as layout from '@nikkierp/ui/appState/layoutSlice';
import * as routing from '@nikkierp/ui/appState/routingSlice';
import { RegisterReducerFn } from '@nikkierp/ui/microApp';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import * as auth from '../authenticate/authSlice';
import * as shellConfig from '../config/shellConfigSlice';
import * as userContext from '../userContext/userContextSlice';


const localReducers = {
	[auth.SLICE_NAME]: auth.reducer,
	[layout.SLICE_NAME]: layout.reducer,
	[routing.SLICE_NAME]: routing.reducer,
	[shellConfig.SLICE_NAME]: shellConfig.reducer,
	[userContext.SLICE_NAME]: userContext.reducer,
};

const lazyReducers: Record<string, any> = {};

function createRootReducer() {
	return combineReducers({
		...localReducers,
		...lazyReducers,
	});
}

// const authSessionListener = createListenerMiddleware();
// authSessionListener.startListening({
// 	matcher: isAnyOf(continueSignIn.fulfilled, restoreAuthSessionThunk.fulfilled),
// 	effect(action, listenerApi) {
// 		if (continueSignIn.fulfilled.match(action)) {
// 			const payload = action.payload;
// 			if (payload?.done && payload?.data?.accessToken) {
// 				queueMicrotask(() => {
// 					listenerApi.dispatch(fetchUserContextAction());
// 				});
// 			}
// 			return;
// 		}
// 		if (restoreAuthSessionThunk.fulfilled.match(action)) {
// 			if (action.payload && getAccessToken()) {
// 				queueMicrotask(() => {
// 					listenerApi.dispatch(fetchUserContextAction());
// 				});
// 			}
// 		}
// 	},
// });

export const store = configureStore({
	reducer: createRootReducer(),
	// middleware: (getDefaultMiddleware) =>
	// 	getDefaultMiddleware().prepend(authSessionListener.middleware),
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

