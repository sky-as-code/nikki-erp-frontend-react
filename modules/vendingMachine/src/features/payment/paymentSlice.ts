import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { paymentService } from './paymentService';
import { PaymentMethod } from './types';



export const SLICE_NAME = 'vendingMachine.payment';

export type PaymentState = {
	detail: ReduxActionState<PaymentMethod>;
	list: ReduxActionState<PaymentMethod[]>;
	create: ReduxActionState<PaymentMethod>;
	update: ReduxActionState<PaymentMethod>;
	delete: ReduxActionState<void>;
};

export const initialPaymentState: PaymentState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listPayments = createAsyncThunk<
	PaymentMethod[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listPayments`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await paymentService.listPayments();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list payments';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getPayment = createAsyncThunk<
	PaymentMethod | undefined,
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
	},
	extraReducers: (builder) => {
		listPaymentsReducers(builder);
		getPaymentReducers(builder);
		createPaymentReducers(builder);
		updatePaymentReducers(builder);
		deletePaymentReducers(builder);
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
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listPayments.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list payments';
			state.list.data = [];
		});
}

function getPaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(getPayment.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
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
		.addCase(createPayment.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createPayment.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createPayment.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create payment';
		});
}

function updatePaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(updatePayment.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updatePayment.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((p) => p.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updatePayment.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update payment';
		});
}

function deletePaymentReducers(builder: ActionReducerMapBuilder<PaymentState>) {
	builder
		.addCase(deletePayment.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deletePayment.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((p) => p.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deletePayment.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete payment';
		});
}


export const actions = {
	...paymentSlice.actions,
};

export const { reducer } = paymentSlice;
