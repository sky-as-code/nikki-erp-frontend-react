import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice,
} from '@reduxjs/toolkit';

import { revokeRequestService } from './revokeRequestService';

import type { CreateRevokeRequestInput } from './revokeRequestService';
import type { RevokeRequest, RevokeRequestState } from './types';


export const SLICE_NAME = 'authorize.revokeRequest';

const initialState: RevokeRequestState = {
	revokeRequests: [],
	isLoadingList: false,
	errorList: null,
	revokeRequestDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listRevokeRequests = createAsyncThunk<
	RevokeRequest[],
	{ graph?: Record<string, unknown>; page?: number; size?: number } | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/list`,
	async (params, { rejectWithValue }) => {
		try {
			return await revokeRequestService.list(params || undefined);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list revoke requests';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getRevokeRequest = createAsyncThunk<
	RevokeRequest | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/get`,
	async (id, { rejectWithValue }) => {
		try {
			return await revokeRequestService.get(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get revoke request';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteRevokeRequest = createAsyncThunk<
	void,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/delete`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await revokeRequestService.remove(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete revoke request';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createRevokeRequest = createAsyncThunk<
	RevokeRequest,
	CreateRevokeRequestInput,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (data, { rejectWithValue }) => {
		try {
			return await revokeRequestService.create(data);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create revoke request';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createRevokeRequests = createAsyncThunk<
	{ count: number },
	{ items: CreateRevokeRequestInput[] },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createMany`,
	async ({ items }, { rejectWithValue }) => {
		try {
			return await revokeRequestService.createSmart(items);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create revoke requests';
			return rejectWithValue(errorMessage);
		}
	},
);

const revokeRequestSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		listReducers(builder);
		detailReducers(builder);
		createReducers(builder);
		deleteReducers(builder);
	},
});

function listReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(listRevokeRequests.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listRevokeRequests.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.errorList = null;
			state.revokeRequests = action.payload;
		})
		.addCase(listRevokeRequests.rejected, (state, action) => {
			state.isLoadingList = false;
			state.errorList = action.payload ?? null;
		});
}

function detailReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(getRevokeRequest.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getRevokeRequest.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = null;
			state.revokeRequestDetail = action.payload;
		})
		.addCase(getRevokeRequest.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload ?? null;
			state.revokeRequestDetail = undefined;
		});
}

function createReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(createRevokeRequest.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(createRevokeRequest.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.errorList = null;
			state.revokeRequests.unshift(action.payload);
		})
		.addCase(createRevokeRequest.rejected, (state, action) => {
			state.isLoadingList = false;
			state.errorList = action.payload ?? null;
		});

	builder
		.addCase(createRevokeRequests.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(createRevokeRequests.fulfilled, (state) => {
			state.isLoadingList = false;
			state.errorList = null;
		})
		.addCase(createRevokeRequests.rejected, (state, action) => {
			state.isLoadingList = false;
			state.errorList = action.payload ?? null;
		});
}

function deleteReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(deleteRevokeRequest.fulfilled, (state, action) => {
			const id = action.meta.arg.id;
			state.revokeRequests = state.revokeRequests.filter((i) => i.id !== id);
			if (state.revokeRequestDetail?.id === id) {
				state.revokeRequestDetail = undefined;
			}
		});
}

export const reducer = revokeRequestSlice.reducer;
export const actions = revokeRequestSlice.actions;

