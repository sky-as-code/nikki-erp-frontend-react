import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { authService } from './authService';
import { fetchProfileAction } from './userContextSlice';


export const SLICE_NAME = 'shellAuth';
export type User = {
	id: string;
	email: string;
	name: string;
	role: string;
};

export type LoginCredentials = {
	email: string;
	password: string;
	rememberMe?: boolean;
};

export type LoginResponse = {
	user: User;
	token: string;
	refreshToken: string;
};

export type AuthState = {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
	refreshToken: string | null;
	loading: boolean;
	error: string | null;
};

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	token: null,
	refreshToken: null,
	loading: false,
	error: null,
};

export const signInAction = createAsyncThunk<
	LoginResponse,
	LoginCredentials,
	{ rejectValue: string; dispatch: (action: ReturnType<typeof fetchProfileAction>) => void }
>(
	`${SLICE_NAME}/signIn`,
	async (credentials, { rejectWithValue, dispatch }) => {
		try {
			const result = await authService.signIn(credentials);
			// Defer to dispatch fetchProfileAction after signInAction.fulfilled has run.
			queueMicrotask(() => dispatch(fetchProfileAction()));
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
			state.token = null;
			state.refreshToken = null;
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
		builder
			.addCase(signInAction.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(signInAction.fulfilled, (state, action) => {
				state.loading = false;
				state.isAuthenticated = true;
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.refreshToken = action.payload.refreshToken;
				state.error = null;
			})
			.addCase(signInAction.rejected, (state, action) => {
				state.loading = false;
				state.isAuthenticated = false;
				state.user = null;
				state.token = null;
				state.refreshToken = null;
				state.error = action.payload || 'Login failed';
			})
			.addCase(signOutAction.pending, (state) => {
				state.isAuthenticated = false;
				state.user = null;
				state.token = null;
				state.refreshToken = null;
				state.error = null;
			})
			.addCase(signOutAction.fulfilled, (state) => {
				state.loading = false;
				state.isAuthenticated = false;
				state.user = null;
				state.token = null;
				state.refreshToken = null;
				state.error = null;
			})
			.addCase(signOutAction.rejected, (state, action) => {
				console.error(action.payload);
			});
	},
});

// Action creators are generated for each case reducer function
export const {
	clearSignInError: clearSignInErrorAction,
	setUser: setUserAction,
} = authSlice.actions;

export const { reducer } = authSlice;