import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';


import { authService } from './authService';


export const SLICE_NAME = 'shellUserContext';

export type User = {
	id: string;
	email: string;
	name: string;
	role: string;
};

export type Organization = {
	id: string;
	name: string;
	slug: string;
};

export type UserContextState = {
	user?: User;
	orgs?: Organization[];
	isLoading: boolean;
	error?: string;
};

const initialState: UserContextState = {
	isLoading: false,
};

export const fetchProfileAction = createAsyncThunk<
	User,
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchProfile`,
	async (_, { rejectWithValue }) => {
		try {
			const profile = await authService.fetchProfile();
			return profile;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
			return rejectWithValue(errorMessage);
		}
	},
);

const userContextSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		clearProfileError: (state) => {
			state.error = undefined;
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
		},
		clearUser: (state) => {
			state.user = undefined;
			state.error = undefined;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProfileAction.pending, (state) => {
				state.isLoading = true;
				state.error = undefined;
			})
			.addCase(fetchProfileAction.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.error = undefined;
			})
			.addCase(fetchProfileAction.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || 'Failed to fetch profile';
			});
	},
});

// Action creators are generated for each case reducer function
export const {
	clearProfileError: clearProfileErrorAction,
	setUser: setUserAction,
	clearUser: clearUserAction,
} = userContextSlice.actions;

export const { reducer } = userContextSlice;
