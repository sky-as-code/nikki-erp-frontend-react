import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { PagedSearchResponse, Pagination, RestArchiveResponse, SearchParams } from '@/types';

import { paymentService } from './paymentService';
import { PaymentMethod } from './types';




export const SLICE_NAME = 'vendingMachine.payment';

export type PaymentState = {
	detail: ReduxActionState<PaymentMethod>;
	list: ReduxActionState<PaymentMethod[]>;
	listPagination: Pagination;
	create: ReduxActionState<PaymentMethod>;
	update: ReduxActionState<PaymentMethod>;
	delete: ReduxActionState<void>;
	archive: ReduxActionState<RestArchiveResponse>;
};

export const DEFAULT_PAGE_SIZE = 10;

export const initialPaymentState: PaymentState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	listPagination: { total: 0, page: 0, size: DEFAULT_PAGE_SIZE },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
};


export const listPayments = createAsyncThunk<
	PagedSearchResponse<PaymentMethod>,
	SearchParams<PaymentMethod> | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listPayments`,
	async (params, { rejectWithValue }) => {
		try {
			return await paymentService.listPayments(params);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list payments';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getPayment = createAsyncThunk<
	PaymentMethod,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getPayment`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await paymentService.getPayment(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get payment';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createPayment = createAsyncThunk<
	PaymentMethod,
	Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createPayment`,
	async (payment, { rejectWithValue }) => {
		try {
			const result = await paymentService.createPayment(payment);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updatePayment = createAsyncThunk<
	PaymentMethod,
	{ id: string; etag: string; updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updatePayment`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await paymentService.updatePayment(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update payment';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deletePayment = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deletePayment`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await paymentService.deletePayment(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setArchivedPayment = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedPayment`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await paymentService.setArchivedPayment(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set archived payment';
			return rejectWithValue(errorMessage);
		}
	},
);

const paymentSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialPaymentState,
	reducers: {
		setPayments: (state, action: PayloadAction<PaymentMethod[]>) => {
			state.list.data = action.payload;
		},
		resetCreatePayment: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdatePayment: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeletePayment: (state) => {
			state.delete = baseReduxActionState;
		},
		resetSetArchivedPayment: (state) => {
			state.archive = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listPaymentsReducers(builder);
		getPaymentReducers(builder);
		createPaymentReducers(builder);
		updatePaymentReducers(builder);
		deletePaymentReducers(builder);
		setArchivedPaymentReducers(builder);
	},
});

function listPaymentsReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(listPayments.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listPayments.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
			state.listPagination = {
				total: action.payload.total,
				page: action.payload.page,
				size: action.payload.size,
			};
		})
		.addCase(listPayments.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list payments';
			state.list.data = [];
		});
}

function getPaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(getPayment.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getPayment.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getPayment.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get payment';
			state.detail.data = undefined;
		});
}

function createPaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(createPayment.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createPayment.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createPayment.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create payment';
			state.create.requestId = action.meta.requestId;
		});
}

function updatePaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(updatePayment.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updatePayment.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updatePayment.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update payment';
			state.update.requestId = action.meta.requestId;
		});
}

function deletePaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(deletePayment.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deletePayment.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deletePayment.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete payment';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedPaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(setArchivedPayment.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedPayment.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedPayment.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to set archived payment';
			state.archive.requestId = action.meta.requestId;
		});
}


export const actions = {
	...paymentSlice.actions,
};

export const { reducer } = paymentSlice;
