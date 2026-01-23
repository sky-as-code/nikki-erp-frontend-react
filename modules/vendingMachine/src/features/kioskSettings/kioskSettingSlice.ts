import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskSettingService } from './kioskSettingService';
import { KioskSetting } from './types';



export const SLICE_NAME = 'vendingMachine.kioskSetting';

export type KioskSettingState = {
	detail: ReduxActionState<KioskSetting>;
	list: ReduxActionState<KioskSetting[]>;
	create: ReduxActionState<KioskSetting>;
	update: ReduxActionState<KioskSetting>;
	delete: ReduxActionState<void>;
};

export const initialKioskSettingState: KioskSettingState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listKioskSettings = createAsyncThunk<
	KioskSetting[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskSettings`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await kioskSettingService.listKioskSettings();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosk settings';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKioskSetting = createAsyncThunk<
	KioskSetting | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKioskSetting`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await kioskSettingService.getKioskSetting(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskSetting = createAsyncThunk<
	KioskSetting,
	Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskSetting`,
	async (setting, { rejectWithValue }) => {
		try {
			const result = await kioskSettingService.createKioskSetting(setting);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKioskSetting = createAsyncThunk<
	KioskSetting,
	{ id: string; etag: string; updates: Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskSetting`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await kioskSettingService.updateKioskSetting(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskSetting = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskSetting`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await kioskSettingService.deleteKioskSetting(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskSettingSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskSettingState,
	reducers: {
		setKioskSettings: (state, action: PayloadAction<KioskSetting[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKioskSetting: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKioskSetting: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKioskSetting: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKioskSettingsReducers(builder);
		getKioskSettingReducers(builder);
		createKioskSettingReducers(builder);
		updateKioskSettingReducers(builder);
		deleteKioskSettingReducers(builder);
	},
});

function listKioskSettingsReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(listKioskSettings.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKioskSettings.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listKioskSettings.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosk settings';
			state.list.data = [];
		});
}

function getKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(getKioskSetting.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getKioskSetting.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKioskSetting.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk setting';
			state.detail.data = undefined;
		});
}

function createKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(createKioskSetting.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createKioskSetting.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createKioskSetting.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk setting';
		});
}

function updateKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(updateKioskSetting.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateKioskSetting.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((s) => s.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateKioskSetting.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk setting';
		});
}

function deleteKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(deleteKioskSetting.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteKioskSetting.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((s) => s.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteKioskSetting.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk setting';
		});
}


export const actions = {
	...kioskSettingSlice.actions,
};

export const { reducer } = kioskSettingSlice;

