import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { settingService } from './settingService';
import { Setting } from './types';


export const SLICE_NAME = 'vendingMachine.setting';

export type SettingState = {
	detail: ReduxActionState<Setting>;
	list: ReduxActionState<Setting[]>;
	create: ReduxActionState<Setting>;
	update: ReduxActionState<Setting>;
	delete: ReduxActionState<void>;
};

export const initialSettingState: SettingState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listSettings = createAsyncThunk<
	Setting[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listSettings`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await settingService.listSettings();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list settings';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getSetting = createAsyncThunk<
	Setting | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getSetting`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await settingService.getSetting(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createSetting = createAsyncThunk<
	Setting,
	Omit<Setting, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createSetting`,
	async (setting, { rejectWithValue }) => {
		try {
			const result = await settingService.createSetting(setting);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateSetting = createAsyncThunk<
	Setting,
	{ id: string; etag: string; updates: Partial<Omit<Setting, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateSetting`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await settingService.updateSetting(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteSetting = createAsyncThunk<
	void,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteSetting`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await settingService.deleteSetting(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete setting';
			return rejectWithValue(errorMessage);
		}
	},
);

const settingSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialSettingState,
	reducers: {
		setSettings: (state, action: PayloadAction<Setting[]>) => {
			state.list.data = action.payload;
		},
		resetCreateSetting: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateSetting: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteSetting: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listSettingsReducers(builder);
		getSettingReducers(builder);
		createSettingReducers(builder);
		updateSettingReducers(builder);
		deleteSettingReducers(builder);
	},
});

function listSettingsReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(listSettings.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listSettings.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listSettings.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list settings';
			state.list.data = [];
		});
}

function getSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(getSetting.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getSetting.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getSetting.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get setting';
			state.detail.data = undefined;
		});
}

function createSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(createSetting.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createSetting.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createSetting.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create setting';
			state.create.requestId = action.meta.requestId;
		});
}

function updateSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(updateSetting.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateSetting.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateSetting.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update setting';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(deleteSetting.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteSetting.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.requestId = action.meta.requestId;
			// if (state.list.data) {
			// 	state.list.data = state.list.data.filter((s) => s.id !== action.meta.arg.id);
			// }
			// if (state.detail.data?.id === action.meta.arg.id) {
			// 	state.detail.data = undefined;
			// }
		})
		.addCase(deleteSetting.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete setting';
			state.delete.requestId = action.meta.requestId;
		});
}

export const actions = {
	...settingSlice.actions,
};

export const { reducer } = settingSlice;
