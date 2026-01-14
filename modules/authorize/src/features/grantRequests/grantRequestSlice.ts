import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import { grantRequestService } from './grantRequestService';
import { GrantRequest, RequestStatus } from './types';
import { ReduxActionState, createInitialReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'authorize.grantRequests';

export type GrantRequestState = {
	grantRequests: GrantRequest[];
	grantRequestDetail?: GrantRequest;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<GrantRequest>;
	respond: ReduxActionState<GrantRequest>;
	cancel: ReduxActionState<void>;
	delete: ReduxActionState<void>;
};

const initialState: GrantRequestState = {
	grantRequests: [],
	grantRequestDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: createInitialReduxActionState(),
	respond: createInitialReduxActionState(),
	cancel: createInitialReduxActionState(),
	delete: createInitialReduxActionState(),
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
	{ id: string; decision: 'approve' | 'deny'; etag: string; responderId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/respond`,
	async ({ id, decision, etag, responderId }, { rejectWithValue }) => {
		try {
			return await grantRequestService.respond(id, decision, etag, responderId);
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
		resetCreateGrantRequest: (state) => {
			state.create = createInitialReduxActionState();
		},
		resetRespondGrantRequest: (state) => {
			state.respond = createInitialReduxActionState();
		},
		resetCancelGrantRequest: (state) => {
			state.cancel = createInitialReduxActionState();
		},
		resetDeleteGrantRequest: (state) => {
			state.delete = createInitialReduxActionState();
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
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listGrantRequests.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.grantRequests = action.payload;
		})
		.addCase(listGrantRequests.rejected, (state, action) => {
			state.list.isLoading = false;
			state.grantRequests = [];
			state.list.error = action.payload ?? null;
		});
}

function detailReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(getGrantRequest.pending, (state) => {
			state.grantRequestDetail = undefined;
		})
		.addCase(getGrantRequest.fulfilled, (state, action) => {
			state.grantRequestDetail = action.payload;
		})
		.addCase(getGrantRequest.rejected, (state) => {
			state.grantRequestDetail = undefined;
		});
}

function createReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(createGrantRequest.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createGrantRequest.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.grantRequestDetail = action.payload;
			state.grantRequests.push(action.payload);
		})
		.addCase(createGrantRequest.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload ?? 'Failed to create grant request';
		});
}

function respondReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(respondGrantRequest.pending, (state, action) => {
			state.respond.status = 'pending';
			state.respond.error = null;
			state.respond.requestId = action.meta.requestId;
		})
		.addCase(respondGrantRequest.fulfilled, (state, action) => {
			state.respond.status = 'success';
			state.respond.data = action.payload;
			state.grantRequestDetail = action.payload;
			const idx = state.grantRequests.findIndex((i) => i.id === action.payload.id);
			if (idx >= 0) state.grantRequests[idx] = action.payload;
		})
		.addCase(respondGrantRequest.rejected, (state, action) => {
			state.respond.status = 'error';
			state.respond.error = action.payload ?? 'Failed to respond grant request';
		});
}

function cancelReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(cancelGrantRequest.pending, (state, action) => {
			state.cancel.status = 'pending';
			state.cancel.error = null;
			state.cancel.requestId = action.meta.requestId;
		})
		.addCase(cancelGrantRequest.fulfilled, (state, action) => {
			state.cancel.status = 'success';
			const id = action.meta.arg.id;
			const item = state.grantRequests.find((i) => i.id === id);
			if (item) item.status = RequestStatus.CANCELLED;
			if (state.grantRequestDetail?.id === id) {
				state.grantRequestDetail.status = RequestStatus.CANCELLED;
			}
		})
		.addCase(cancelGrantRequest.rejected, (state, action) => {
			state.cancel.status = 'error';
			state.cancel.error = action.payload ?? 'Failed to cancel grant request';
		});
}

function deleteReducers(builder: ActionReducerMapBuilder<GrantRequestState>) {
	builder
		.addCase(deleteGrantRequest.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteGrantRequest.fulfilled, (state, action) => {
			state.delete.status = 'success';
			const id = action.meta.arg.id;
			state.grantRequests = state.grantRequests.filter((i) => i.id !== id);
			if (state.grantRequestDetail?.id === id) state.grantRequestDetail = undefined;
		})
		.addCase(deleteGrantRequest.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload ?? 'Failed to delete grant request';
		});
}

export const actions = {
	...grantRequestSlice.actions,
};

export const { reducer } = grantRequestSlice;

