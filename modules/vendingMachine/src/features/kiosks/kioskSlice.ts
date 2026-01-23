import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskService } from './kioskService';
import { Kiosk } from './types';



export const SLICE_NAME = 'vendingMachine.kiosk';

export type KioskState = {
	detail: ReduxActionState<Kiosk>;
	list: ReduxActionState<Kiosk[]>;
	create: ReduxActionState<Kiosk>;
	update: ReduxActionState<Kiosk>;
	delete: ReduxActionState<void>;
};

export const initialKioskState: KioskState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listKiosks = createAsyncThunk<
	Kiosk[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKiosks`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await kioskService.listKiosks();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosks';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKiosk = createAsyncThunk<
	Kiosk | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKiosk`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await kioskService.getKiosk(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKiosk = createAsyncThunk<
	Kiosk,
	Omit<Kiosk, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKiosk`,
	async (kiosk, { rejectWithValue }) => {
		try {
			const result = await kioskService.createKiosk(kiosk);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKiosk = createAsyncThunk<
	Kiosk,
	{ id: string; etag: string; updates: Partial<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKiosk`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await kioskService.updateKiosk(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKiosk = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKiosk`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await kioskService.deleteKiosk(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskState,
	reducers: {
		setKiosks: (state, action: PayloadAction<Kiosk[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKiosk: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKiosk: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKiosk: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKiosksReducers(builder);
		getKioskReducers(builder);
		createKioskReducers(builder);
		updateKioskReducers(builder);
		deleteKioskReducers(builder);
	},
});

function listKiosksReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(listKiosks.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKiosks.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listKiosks.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosks';
			state.list.data = [];
		});
}

function getKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(getKiosk.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getKiosk.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKiosk.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk';
			state.detail.data = undefined;
		});
}

function createKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(createKiosk.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createKiosk.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createKiosk.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk';
		});
}

function updateKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(updateKiosk.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateKiosk.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((k) => k.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateKiosk.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk';
		});
}

function deleteKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(deleteKiosk.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteKiosk.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((k) => k.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteKiosk.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk';
		});
}


export const actions = {
	...kioskSlice.actions,
};

export const { reducer } = kioskSlice;

