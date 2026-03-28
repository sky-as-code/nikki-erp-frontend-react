import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { identityService } from './identityService';

import type { IdentityUser } from './types';


export const SLICE_NAME = 'drive.identity';

export type ListUsersRequest = {
	q?: string;
	graph?: Record<string, unknown>;
	page?: number;
	size?: number;
};

export type IdentityState = {
	users: IdentityUser[];
	isLoadingUsers: boolean;
	errorUsers: string | null;
};

export const initialState: IdentityState = {
	users: [],
	isLoadingUsers: false,
	errorUsers: null,
};

function buildUserSearchGraph(
	params?: ListUsersRequest,
): Record<string, unknown> | undefined {
	if (!params) return undefined;
	const baseGraph = (params.graph ?? {}) as Record<string, unknown>;
	const keyword = params.q?.trim();
	if (!keyword) {
		return Object.keys(baseGraph).length > 0 ? baseGraph : undefined;
	}

	const qGraph = {
		or: [
			{ if: ['display_name', '*', keyword] },
			{ if: ['email', '*', keyword] },
		],
	};

	if (Object.keys(baseGraph).length === 0) {
		return qGraph as Record<string, unknown>;
	}

	return {
		and: [baseGraph, qGraph],
	};
}

export const listUsers = createAsyncThunk<
	IdentityUser[],
	ListUsersRequest | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listUsers`,
	async (params, { rejectWithValue }) => {
		try {
			const request = params
				? {
					page: params.page,
					size: typeof params.size === 'number' ? params.size : undefined,
					graph: buildUserSearchGraph(params),
				}
				: undefined;
			return await identityService.listUsers(request);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to list users';
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

export const reducer = identitySlice.reducer;
export const actions = identitySlice.actions;

