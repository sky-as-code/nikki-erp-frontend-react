import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskTemplateService } from './kioskTemplateService';
import { KioskTemplate } from './types';



export const SLICE_NAME = 'vendingMachine.kioskTemplate';

export type KioskTemplateState = {
	detail: ReduxActionState<KioskTemplate>;
	list: ReduxActionState<KioskTemplate[]>;
	create: ReduxActionState<KioskTemplate>;
	update: ReduxActionState<KioskTemplate>;
	delete: ReduxActionState<void>;
};

export const initialKioskTemplateState: KioskTemplateState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listKioskTemplates = createAsyncThunk<
	KioskTemplate[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskTemplates`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await kioskTemplateService.listKioskTemplates();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosk templates';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKioskTemplate = createAsyncThunk<
	KioskTemplate | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKioskTemplate`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await kioskTemplateService.getKioskTemplate(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk template';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskTemplate = createAsyncThunk<
	KioskTemplate,
	Omit<KioskTemplate, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskTemplate`,
	async (template, { rejectWithValue }) => {
		try {
			const result = await kioskTemplateService.createKioskTemplate(template);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk template';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKioskTemplate = createAsyncThunk<
	KioskTemplate,
	{ id: string; etag: string; updates: Partial<Omit<KioskTemplate, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskTemplate`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await kioskTemplateService.updateKioskTemplate(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk template';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskTemplate = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskTemplate`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await kioskTemplateService.deleteKioskTemplate(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk template';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskTemplateSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskTemplateState,
	reducers: {
		setKioskTemplates: (state, action: PayloadAction<KioskTemplate[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKioskTemplate: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKioskTemplate: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKioskTemplate: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKioskTemplatesReducers(builder);
		getKioskTemplateReducers(builder);
		createKioskTemplateReducers(builder);
		updateKioskTemplateReducers(builder);
		deleteKioskTemplateReducers(builder);
	},
});

function listKioskTemplatesReducers(builder: ActionReducerMapBuilder<KioskTemplateState>) {
	builder
		.addCase(listKioskTemplates.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKioskTemplates.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listKioskTemplates.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosk templates';
			state.list.data = [];
		});
}

function getKioskTemplateReducers(builder: ActionReducerMapBuilder<KioskTemplateState>) {
	builder
		.addCase(getKioskTemplate.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getKioskTemplate.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKioskTemplate.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk template';
			state.detail.data = undefined;
		});
}

function createKioskTemplateReducers(builder: ActionReducerMapBuilder<KioskTemplateState>) {
	builder
		.addCase(createKioskTemplate.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createKioskTemplate.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createKioskTemplate.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk template';
		});
}

function updateKioskTemplateReducers(builder: ActionReducerMapBuilder<KioskTemplateState>) {
	builder
		.addCase(updateKioskTemplate.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateKioskTemplate.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((t) => t.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateKioskTemplate.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk template';
		});
}

function deleteKioskTemplateReducers(builder: ActionReducerMapBuilder<KioskTemplateState>) {
	builder
		.addCase(deleteKioskTemplate.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteKioskTemplate.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((t) => t.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteKioskTemplate.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk template';
		});
}


export const actions = {
	...kioskTemplateSlice.actions,
};

export const { reducer } = kioskTemplateSlice;

