import { createAsyncThunk, createSlice, ActionReducerMapBuilder } from '@reduxjs/toolkit';

import { authService } from './authService';
import { SignInResult } from './types';
import { fetchUserContextAction } from '../userContext/userContextSlice';


export const SLICE_NAME = 'shellAuth';

export type AuthState = {
	error: string | null;
	isSignInSuccess: boolean;
	isLoading: boolean;
	sessionExpiresAt: number | null;
	signInProgress: UnknownRecord | null;
};

const initialState: AuthState = {
	error: null,
	isSignInSuccess: false,
	isLoading: false,
	sessionExpiresAt: null,
	signInProgress: null,
};

export const startSignInAction = createAsyncThunk<
	UnknownRecord,
	{ email: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/startSignIn`,
	async (_, { rejectWithValue }) => {
		try {
			return await authService().startSignIn();
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Start sign-in attempt failed';
			return rejectWithValue(errorMessage);
		}
	},
);

export const continueSignInAction = createAsyncThunk<
	SignInResult,
	UnknownRecord,
	{ rejectValue: string; dispatch: (action: ReturnType<typeof fetchUserContextAction>) => void }
>(
	`${SLICE_NAME}/continueSignIn`,
	async (params, { rejectWithValue, dispatch }) => {
		try {
			const result = await authService().continueSignIn(params);
			if (result.done) {
				queueMicrotask(() => dispatch(fetchUserContextAction()));
			}
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
			return rejectWithValue(errorMessage);
		}
	},
);

export const signOutAction = createAsyncThunk<
	void,
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/signOut`,
	async (_, { rejectWithValue }) => {
		try {
			await authService().signOut();
			return;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Logout failed';
			return rejectWithValue(errorMessage);
		}
	},
);

export const restoreAuthSessionAction = createAsyncThunk<
	boolean,
	void,
	{ rejectValue: string; dispatch: (action: ReturnType<typeof fetchUserContextAction>) => void }
>(
	`${SLICE_NAME}/restoreAuthSession`,
	async (_, { rejectWithValue, dispatch }) => {
		try {
			const isSuccess = await authService().restoreAuthSession();
			if (isSuccess) {
				queueMicrotask(() => dispatch(fetchUserContextAction()));
			}
			return isSuccess;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Restore auth session failed';
			return rejectWithValue(errorMessage);
		}
	},
);

const authSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		addStartSignInReducers(builder);
		addContSignInReducers(builder);
		addSignOutReducers(builder);
		addRestoreAuthSessionReducers(builder);
	},
});

function addStartSignInReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(startSignInAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(startSignInAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.signInProgress = Object.assign({}, state.signInProgress, action.payload);
		})
		.addCase(startSignInAction.rejected, (state, action) => {
			state.isLoading = false;
			state.signInProgress = null;
			state.error = action.payload!;
		});
}

function addContSignInReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(continueSignInAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(continueSignInAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.error = null;
			if (action.payload.done) {
				state.signInProgress = null;
				state.isSignInSuccess = true;
			}
			else {
				state.signInProgress = Object.assign({}, state.signInProgress, action.payload);
			}
		})
		.addCase(continueSignInAction.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload!;
		});
}

function addSignOutReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(signOutAction.pending, (state) => {
			state.isSignInSuccess = false;
			state.error = null;
		})
		.addCase(signOutAction.fulfilled, (state) => {
			state.isLoading = false;
			state.isSignInSuccess = false;
			state.error = null;
		})
		.addCase(signOutAction.rejected, (state, action) => {
			console.error(action.payload);
		});
}

function addRestoreAuthSessionReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(restoreAuthSessionAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(restoreAuthSessionAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.error = null;
			if (action.payload) {
				state.isSignInSuccess = true;
				state.sessionExpiresAt = authService().sessionExpiresAt;
			}
			else {
				state.isSignInSuccess = false;
				state.sessionExpiresAt = 0;
			}
		})
		.addCase(restoreAuthSessionAction.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload!;
		});
}

// export const {
// } = authSlice.actions;

export const { reducer } = authSlice;
