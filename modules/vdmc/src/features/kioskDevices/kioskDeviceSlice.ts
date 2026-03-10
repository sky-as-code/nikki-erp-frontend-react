import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskDeviceService } from './kioskDeviceService';
import { KioskDevice } from './types';



export const SLICE_NAME = 'vendingMachine.kioskDevice';

export type KioskDeviceState = {
	detail: ReduxActionState<KioskDevice>;
	list: ReduxActionState<KioskDevice[]>;
	create: ReduxActionState<KioskDevice>;
	update: ReduxActionState<KioskDevice>;
	delete: ReduxActionState<void>;
};

export const initialKioskDeviceState: KioskDeviceState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listKioskDevices = createAsyncThunk<
	KioskDevice[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskDevices`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await kioskDeviceService.listKioskDevices();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosk devices';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKioskDevice = createAsyncThunk<
	KioskDevice | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKioskDevice`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await kioskDeviceService.getKioskDevice(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk device';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskDevice = createAsyncThunk<
	KioskDevice,
	Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskDevice`,
	async (kioskDevice, { rejectWithValue }) => {
		try {
			const result = await kioskDeviceService.createKioskDevice(kioskDevice);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk device';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKioskDevice = createAsyncThunk<
	KioskDevice,
	{ id: string; etag: string; updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskDevice`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await kioskDeviceService.updateKioskDevice(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk device';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskDevice = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskDevice`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await kioskDeviceService.deleteKioskDevice(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk device';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskDeviceSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskDeviceState,
	reducers: {
		setKioskDevices: (state, action: PayloadAction<KioskDevice[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKioskDevice: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKioskDevice: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKioskDevice: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKioskDevicesReducers(builder);
		getKioskDeviceReducers(builder);
		createKioskDeviceReducers(builder);
		updateKioskDeviceReducers(builder);
		deleteKioskDeviceReducers(builder);
	},
});

function listKioskDevicesReducers(builder: ActionReducerMapBuilder<KioskDeviceState>) {
	builder
		.addCase(listKioskDevices.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKioskDevices.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listKioskDevices.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosk devices';
			state.list.data = [];
		});
}

function getKioskDeviceReducers(builder: ActionReducerMapBuilder<KioskDeviceState>) {
	builder
		.addCase(getKioskDevice.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getKioskDevice.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKioskDevice.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk device';
			state.detail.data = undefined;
		});
}

function createKioskDeviceReducers(builder: ActionReducerMapBuilder<KioskDeviceState>) {
	builder
		.addCase(createKioskDevice.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createKioskDevice.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createKioskDevice.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk device';
		});
}

function updateKioskDeviceReducers(builder: ActionReducerMapBuilder<KioskDeviceState>) {
	builder
		.addCase(updateKioskDevice.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateKioskDevice.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((d) => d.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateKioskDevice.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk device';
		});
}

function deleteKioskDeviceReducers(builder: ActionReducerMapBuilder<KioskDeviceState>) {
	builder
		.addCase(deleteKioskDevice.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteKioskDevice.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((d) => d.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteKioskDevice.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk device';
		});
}


export const actions = {
	...kioskDeviceSlice.actions,
};

export const { reducer } = kioskDeviceSlice;
