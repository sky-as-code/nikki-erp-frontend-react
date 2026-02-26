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
			return await kioskSettingService.listKioskSettings();
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
			return await kioskSettingService.getKioskSetting(id);
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
			return await kioskSettingService.createKioskSetting(setting);
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
			return await kioskSettingService.updateKioskSetting(id, etag, updates);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskSetting = createAsyncThunk<
	void,
	{ id: string },
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
			})
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
			})
			.addCase(createKioskSetting.pending, (state) => {
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
			})
			.addCase(updateKioskSetting.pending, (state) => {
				state.update.status = 'pending';
				state.update.error = null;
			})
			.addCase(updateKioskSetting.fulfilled, (state, action) => {
				state.update.status = 'success';
				state.update.data = action.payload;
				state.detail.data = action.payload;
				if (state.list.data) {
					const idx = state.list.data.findIndex((s) => s.id === action.payload.id);
					if (idx >= 0) state.list.data[idx] = action.payload;
				}
			})
			.addCase(updateKioskSetting.rejected, (state, action) => {
				state.update.status = 'error';
				state.update.error = action.payload || 'Failed to update kiosk setting';
			})
			.addCase(deleteKioskSetting.pending, (state) => {
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
	},
});

export const actions = { ...kioskSettingSlice.actions };
export const { reducer } = kioskSettingSlice;
