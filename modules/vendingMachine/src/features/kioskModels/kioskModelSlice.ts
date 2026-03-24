import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskModelService } from './kioskModelService';
import { KioskModel } from './types';


export const SLICE_NAME = 'vendingMachine.kioskModel';

export type KioskModelState = {
	detail: ReduxActionState<KioskModel>;
	list: ReduxActionState<KioskModel[]>;
	create: ReduxActionState<KioskModel>;
	update: ReduxActionState<KioskModel>;
	delete: ReduxActionState<void>;
};

export const initialKioskModelState: KioskModelState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listKioskModels = createAsyncThunk<
	KioskModel[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskModels`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await kioskModelService.listKioskModels();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosk models';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKioskModel = createAsyncThunk<
	KioskModel | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKioskModel`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await kioskModelService.getKioskModel(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskModel = createAsyncThunk<
	KioskModel,
	Omit<KioskModel, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskModel`,
	async (model, { rejectWithValue }) => {
		try {
			const result = await kioskModelService.createKioskModel(model);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKioskModel = createAsyncThunk<
	KioskModel,
	{ id: string; etag: string; updates: Partial<Omit<KioskModel, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskModel`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await kioskModelService.updateKioskModel(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskModel = createAsyncThunk<
	void,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskModel`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await kioskModelService.deleteKioskModel(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskModelSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskModelState,
	reducers: {
		setKioskModels: (state, action: PayloadAction<KioskModel[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKioskModel: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKioskModel: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKioskModel: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKioskModelsReducers(builder);
		getKioskModelReducers(builder);
		createKioskModelReducers(builder);
		updateKioskModelReducers(builder);
		deleteKioskModelReducers(builder);
	},
});

function listKioskModelsReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(listKioskModels.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKioskModels.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listKioskModels.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosk models';
			state.list.data = [];
		});
}

function getKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(getKioskModel.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getKioskModel.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKioskModel.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk model';
			state.detail.data = undefined;
		});
}

function createKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(createKioskModel.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createKioskModel.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createKioskModel.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk model';
		});
}

function updateKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(updateKioskModel.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateKioskModel.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((m) => m.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateKioskModel.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk model';
		});
}

function deleteKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(deleteKioskModel.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteKioskModel.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((m) => m.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteKioskModel.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk model';
		});
}


export const actions = {
	...kioskModelSlice.actions,
};

export const { reducer } = kioskModelSlice;
