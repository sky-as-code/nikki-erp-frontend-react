import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import { grantRequestService } from './grantRequestService';

import type { GrantRequest, GrantRequestState } from './types';


export const SLICE_NAME = 'authorize.grantRequests';

const initialState: GrantRequestState = {
	items: [],
	isLoadingList: false,
	errorList: null,
	detail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listGrantRequests = createAsyncThunk<GrantRequest[], void, { rejectValue: string }>(
	`${SLICE_NAME}/list`,
	async (_, { rejectWithValue }) => {
		try {
			return await grantRequestService.list();
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to list grant requests';
			return rejectWithValue(msg);
		}
	},
);

export const getGrantRequest = createAsyncThunk<GrantRequest | undefined, string, { rejectValue: string }>(
	`${SLICE_NAME}/get`,
	async (id, { rejectWithValue }) => {
		try {
			return await grantRequestService.get(id);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to get grant request';
			return rejectWithValue(msg);
		}
	},
);

export const createGrantRequest = createAsyncThunk<
	GrantRequest,
	Partial<GrantRequest>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (data, { rejectWithValue }) => {
		try {
			return await grantRequestService.create(data);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to create grant request';
			return rejectWithValue(msg);
		}
	},
);

export const respondGrantRequest = createAsyncThunk<
	GrantRequest,
	{ id: string; decision: 'approve' | 'deny' },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/respond`,
	async ({ id, decision }, { rejectWithValue }) => {
		try {
			return await grantRequestService.respond(id, decision);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to respond grant request';
			return rejectWithValue(msg);
		}
	},
);

export const cancelGrantRequest = createAsyncThunk<void, { id: string }, { rejectValue: string }>(
	`${SLICE_NAME}/cancel`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await grantRequestService.cancel(id);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to cancel grant request';
			return rejectWithValue(msg);
		}
	},
);

export const deleteGrantRequest = createAsyncThunk<void, { id: string }, { rejectValue: string }>(
	`${SLICE_NAME}/delete`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await grantRequestService.remove(id);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to delete grant request';
			return rejectWithValue(msg);
		}
	},
);

const slice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setItems: (state, action: PayloadAction<GrantRequest[]>) => {
			state.items = action.payload;
		},
	},
	extraReducers: (builder) => {
		listReducers(builder);
		detailReducers(builder);
		createReducers(builder);
		respondReducers(builder);
		cancelReducers(builder);
		deleteReducers(builder);
	},
});

function listReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(listGrantRequests.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listGrantRequests.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.items = action.payload;
		})
		.addCase(listGrantRequests.rejected, (state, action) => {
			state.isLoadingList = false;
			state.items = [];
			state.errorList = action.payload ?? null;
		});
}

function detailReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(getGrantRequest.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getGrantRequest.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.detail = action.payload;
		})
		.addCase(getGrantRequest.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.detail = undefined;
			state.errorDetail = action.payload ?? null;
		});
}

function createReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(createGrantRequest.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(createGrantRequest.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.detail = action.payload;
			state.items.push(action.payload);
		})
		.addCase(createGrantRequest.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload ?? null;
		});
}

function respondReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder.addCase(respondGrantRequest.fulfilled, (state, action) => {
		state.detail = action.payload;
		const idx = state.items.findIndex((i) => i.id === action.payload.id);
		if (idx >= 0) state.items[idx] = action.payload;
	});
}

function cancelReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder.addCase(cancelGrantRequest.fulfilled, (state, action) => {
		const id = action.meta.arg.id;
		const item = state.items.find((i) => i.id === id);
		if (item) item.status = 'cancelled';
		if (state.detail?.id === id) state.detail.status = 'cancelled';
	});
}

function deleteReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder.addCase(deleteGrantRequest.fulfilled, (state, action) => {
		const id = action.meta.arg.id;
		state.items = state.items.filter((i) => i.id !== id);
		if (state.detail?.id === id) state.detail = undefined;
	});
}

export const grantRequestActions = {
	...slice.actions,
	listGrantRequests,
	getGrantRequest,
	createGrantRequest,
	respondGrantRequest,
	cancelGrantRequest,
	deleteGrantRequest,
};

export const grantRequestReducer = slice.reducer;

