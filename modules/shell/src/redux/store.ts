import { configureStore } from '@reduxjs/toolkit';

import * as auth from '../features/auth/authSlice';
import * as userContext from '../features/auth/userContextSlice';


export const store = configureStore({
	reducer: {
		[auth.SLICE_NAME]: auth.reducer,
		[userContext.SLICE_NAME]: userContext.reducer,
	},
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;