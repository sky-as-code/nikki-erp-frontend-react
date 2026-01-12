import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice,
} from '@reduxjs/toolkit';

import { identityService } from './identityService';

import type { User, Group } from './types';
import type { Org } from '@/features/orgs';


export const SLICE_NAME = 'authorize.identity';

export type IdentityState = {
	users: User[];
	groups: Group[];
	orgs: Org[];
	isLoadingUsers: boolean;
	errorUsers: string | null;
	isLoadingGroups: boolean;
	errorGroups: string | null;
	isLoadingOrgs: boolean;
	errorOrgs: string | null;
};

const initialState: IdentityState = {
	users: [],
	groups: [],
	orgs: [],
	isLoadingUsers: false,
	errorUsers: null,
	isLoadingGroups: false,
	errorGroups: null,
	isLoadingOrgs: false,
	errorOrgs: null,
};

export const listUsers = createAsyncThunk<
	User[],
	{ query?: Record<string, unknown>; page?: number; size?: number } | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listUsers`,
	async (params, { rejectWithValue }) => {
		try {
			return await identityService.listUsers(params || undefined);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list users';
			return rejectWithValue(errorMessage);
		}
	},
);

export const listGroups = createAsyncThunk<
	Group[],
	{ query?: Record<string, unknown>; page?: number; size?: number } | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listGroups`,
	async (params, { rejectWithValue }) => {
		try {
			return await identityService.listGroups(params || undefined);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list groups';
			return rejectWithValue(errorMessage);
		}
	},
);

export const listOrgs = createAsyncThunk<
	Org[],
	{ query?: Record<string, unknown>; page?: number; size?: number } | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listOrgs`,
	async (params, { rejectWithValue }) => {
		try {
			return await identityService.listOrgs(params || undefined);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list orgs';
			return rejectWithValue(errorMessage);
		}
	},
);

const identitySlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		usersReducers(builder);
		groupsReducers(builder);
		orgsReducers(builder);
	},
});

function usersReducers(builder: ActionReducerMapBuilder<IdentityState>) {
	builder
		.addCase(listUsers.pending, (state) => {
			state.isLoadingUsers = true;
			state.errorUsers = null;
		})
		.addCase(listUsers.fulfilled, (state, action) => {
			state.isLoadingUsers = false;
			state.errorUsers = null;
			state.users = action.payload;
		})
		.addCase(listUsers.rejected, (state, action) => {
			state.isLoadingUsers = false;
			state.errorUsers = action.payload ?? null;
		});
}

function groupsReducers(builder: ActionReducerMapBuilder<IdentityState>) {
	builder
		.addCase(listGroups.pending, (state) => {
			state.isLoadingGroups = true;
			state.errorGroups = null;
		})
		.addCase(listGroups.fulfilled, (state, action) => {
			state.isLoadingGroups = false;
			state.errorGroups = null;
			state.groups = action.payload;
		})
		.addCase(listGroups.rejected, (state, action) => {
			state.isLoadingGroups = false;
			state.errorGroups = action.payload ?? null;
		});
}

function orgsReducers(builder: ActionReducerMapBuilder<IdentityState>) {
	builder
		.addCase(listOrgs.pending, (state) => {
			state.isLoadingOrgs = true;
			state.errorOrgs = null;
		})
		.addCase(listOrgs.fulfilled, (state, action) => {
			state.isLoadingOrgs = false;
			state.errorOrgs = null;
			state.orgs = action.payload;
		})
		.addCase(listOrgs.rejected, (state, action) => {
			state.isLoadingOrgs = false;
			state.errorOrgs = action.payload ?? null;
		});
}

export const reducer = identitySlice.reducer;
export const actions = identitySlice.actions;

