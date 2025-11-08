import { createAsyncThunk, createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';

import { authService, User } from './authService';
import { SignInResult } from './types';
// import { fetchProfileAction } from './userContextSlice';


export const SLICE_NAME = 'shellAuth';

export type AuthState = {
	error: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	signInProgress: UnknownRecord | null;
};

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	isLoading: false,
	error: null,
	signInProgress: null,
};

export const startAttemptAction = createAsyncThunk<
	UnknownRecord,
	{ email: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/startSignInAttempt`,
	async (_, { rejectWithValue }) => {
		try {
			return await authService.startSession();
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Start sign in attempt failed';
			return rejectWithValue(errorMessage);
		}
	},
);

export const signInAction = createAsyncThunk<
	SignInResult,
	UnknownRecord,
	{ rejectValue: string }
// { rejectValue: string; dispatch: (action: ReturnType<typeof fetchProfileAction>) => void }
>(
	`${SLICE_NAME}/signIn`,
	async (params, { rejectWithValue }) => {
		try {
			const result = await authService.signIn(params);
			// queueMicrotask(() => dispatch(fetchProfileAction()));
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Login failed';
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
			await authService.signOut();
			return;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Logout failed';
			return rejectWithValue(errorMessage);
		}
	},
);

const authSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		signOut: (state) => {
			state.isAuthenticated = false;
			state.user = null;
			state.error = null;
		},
		clearSignInError: (state) => {
			state.error = null;
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			state.isAuthenticated = true;
		},
	},
	extraReducers: (builder) => {
		addSignInReducers(builder);
		addSignOutReducers(builder);
		addStartAttemptReducers(builder);
	},
});

function addSignInReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(signInAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(signInAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.error = null;
			if (action.payload.done) {
				state.signInProgress = null;
				state.isAuthenticated = true;
			}
			else {
				state.signInProgress = Object.assign({}, state.signInProgress, action.payload);
			}
		})
		.addCase(signInAction.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload!;
		});
}

function addSignOutReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(signOutAction.pending, (state) => {
			state.isAuthenticated = false;
			state.user = null;
			state.error = null;
		})
		.addCase(signOutAction.fulfilled, (state) => {
			state.isLoading = false;
			state.isAuthenticated = false;
			state.user = null;
			state.error = null;
		})
		.addCase(signOutAction.rejected, (state, action) => {
			console.error(action.payload);
		});
}

function addStartAttemptReducers(builder: ActionReducerMapBuilder<AuthState>): void {
	builder
		.addCase(startAttemptAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(startAttemptAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.signInProgress = Object.assign({}, state.signInProgress, action.payload);
		})
		.addCase(startAttemptAction.rejected, (state, action) => {
			state.isLoading = false;
			state.signInProgress = null;
			state.error = action.payload!;
		});
}

// Action creators are generated for each case reducer function
export const {
	clearSignInError: clearSignInErrorAction,
	setUser: setUserAction,
} = authSlice.actions;

export const { reducer } = authSlice;
