import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice,
} from '@reduxjs/toolkit';

import { revokeRequestService } from './revokeRequestService';
import { ReduxActionState, baseReduxActionState } from '../../appState/reduxActionState';

import type { CreateRevokeRequestInput } from './revokeRequestService';
import type { RevokeRequest } from './types';


export const SLICE_NAME = 'authorize.revokeRequest';

export type RevokeRequestState = {
	revokeRequests: RevokeRequest[];
	revokeRequestDetail?: RevokeRequest;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<RevokeRequest>;
	createMany: ReduxActionState<{ count: number }>;
	delete: ReduxActionState<void>;
};

export const initialState: RevokeRequestState = {
	revokeRequests: [],
	revokeRequestDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: baseReduxActionState,
	createMany: baseReduxActionState,
	delete: baseReduxActionState,
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
	reducers: {
		resetCreateRevokeRequest: (state) => {
			state.create = baseReduxActionState;
		},
		resetCreateManyRevokeRequest: (state) => {
			state.createMany = baseReduxActionState;
		},
		resetDeleteRevokeRequest: (state) => {
			state.delete = baseReduxActionState;
		},
	},
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
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listRevokeRequests.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.list.error = null;
			state.revokeRequests = action.payload;
		})
		.addCase(listRevokeRequests.rejected, (state, action) => {
			state.list.isLoading = false;
			state.list.error = action.payload ?? null;
		});
}

function detailReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(getRevokeRequest.pending, (state) => {
			state.revokeRequestDetail = undefined;
		})
		.addCase(getRevokeRequest.fulfilled, (state, action) => {
			state.revokeRequestDetail = action.payload;
		})
		.addCase(getRevokeRequest.rejected, (state) => {
			state.revokeRequestDetail = undefined;
		});
}

// eslint-disable-next-line max-lines-per-function
function createReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(createRevokeRequest.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createRevokeRequest.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.revokeRequests.unshift(action.payload);
		})
		.addCase(createRevokeRequest.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload ?? 'Failed to create revoke request';
		});

	builder
		.addCase(createRevokeRequests.pending, (state, _action) => {
			state.createMany.status = 'pending';
			state.createMany.error = null;
		})
		.addCase(createRevokeRequests.fulfilled, (state, action) => {
			state.createMany.status = 'success';
			state.createMany.data = action.payload;
		})
		.addCase(createRevokeRequests.rejected, (state, action) => {
			state.createMany.status = 'error';
			state.createMany.error = action.payload ?? 'Failed to create revoke requests';
		});
}

function deleteReducers(builder: ActionReducerMapBuilder<RevokeRequestState>) {
	builder
		.addCase(deleteRevokeRequest.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteRevokeRequest.fulfilled, (state, action) => {
			state.delete.status = 'success';
			const id = action.meta.arg.id;
			state.revokeRequests = state.revokeRequests.filter((i) => i.id !== id);
			if (state.revokeRequestDetail?.id === id) {
				state.revokeRequestDetail = undefined;
			}
		})
		.addCase(deleteRevokeRequest.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload ?? 'Failed to delete revoke request';
		});
}

export const reducer = revokeRequestSlice.reducer;
export const actions = revokeRequestSlice.actions;

