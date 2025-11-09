import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';


import { UserContext, userContextService } from './userContextService';
import { EntitlementAssignment, Organization, User } from './userContextService';


export const SLICE_NAME = 'shellUserContext';

export type UserContextState = {
	user: User | null;
	orgs: Organization[];
	permissions: EntitlementAssignment[];
	isLoading: boolean;
	error: string | null;
};

const initialState: UserContextState = {
	isLoading: false,
	error: null,
	user: null,
	orgs: [],
	permissions: [],
};

export const fetchUserContextAction = createAsyncThunk<
	UserContext,
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchUserContext`,
	async (_, { rejectWithValue }) => {
		try {
			const context = await userContextService.fetch();
			return context;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user context';
			return rejectWithValue(errorMessage);
		}
	},
);

const userContextSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		clear: (state) => {
			Object.assign(state, initialState);
		},
	},
	extraReducers: (builder) => {
		addFetchProfileReducers(builder);
	},
});

function addFetchProfileReducers(builder: ActionReducerMapBuilder<UserContextState>): void {
	builder
		.addCase(fetchUserContextAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(fetchUserContextAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.error = null;
			state.user = action.payload.user;
			state.orgs = action.payload.orgs;
			state.permissions = action.payload.permissions;
		})
		.addCase(fetchUserContextAction.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload || 'Failed to fetch user context';
		});
}

export const {
	clear: clearAction,
} = userContextSlice.actions;

export const { reducer } = userContextSlice;
