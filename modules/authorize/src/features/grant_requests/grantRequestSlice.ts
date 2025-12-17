import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import { grantRequestService } from './grantRequestService';
import { GrantRequest, GrantRequestState, RequestStatus } from './types';


export const SLICE_NAME = 'authorize.grantRequests';

const initialState: GrantRequestState = {
	grantRequests: [],
	isLoadingList: false,
	errorList: null,
	grantRequestDetail: undefined,
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

const grantRequestSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setGrantRequests: (state, action: PayloadAction<GrantRequest[]>) => {
			state.grantRequests = action.payload;
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
			state.grantRequests = action.payload;
		})
		.addCase(listGrantRequests.rejected, (state, action) => {
			state.isLoadingList = false;
			state.grantRequests = [];
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
			state.grantRequestDetail = action.payload;
		})
		.addCase(getGrantRequest.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.grantRequestDetail = undefined;
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
			state.grantRequestDetail = action.payload;
			state.grantRequests.push(action.payload);
		})
		.addCase(createGrantRequest.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload ?? null;
		});
}

function respondReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder.addCase(respondGrantRequest.fulfilled, (state, action) => {
		state.grantRequestDetail = action.payload;
		const idx = state.grantRequests.findIndex((i) => i.id === action.payload.id);
		if (idx >= 0) state.grantRequests[idx] = action.payload;
	});
}

function cancelReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder.addCase(cancelGrantRequest.fulfilled, (state, action) => {
		const id = action.meta.arg.id;
		const item = state.grantRequests.find((i) => i.id === id);
		if (item) item.status = RequestStatus.CANCELLED;
		if (state.grantRequestDetail?.id === id) {
			state.grantRequestDetail.status = RequestStatus.CANCELLED;
		}
	});
}

function deleteReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder.addCase(deleteGrantRequest.fulfilled, (state, action) => {
		const id = action.meta.arg.id;
		state.grantRequests = state.grantRequests.filter((i) => i.id !== id);
		if (state.grantRequestDetail?.id === id) state.grantRequestDetail = undefined;
	});
}

export const actions = {
	...grantRequestSlice.actions,
};

export const { reducer } = grantRequestSlice;

