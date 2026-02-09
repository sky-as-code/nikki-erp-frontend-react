import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	PayloadAction,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { unitService } from './unitService';

import type {
	CreateUnitRequest,
	CreateUnitResponse,
	DeleteUnitResponse,
	SearchUnitsResponse,
	Unit,
	UpdateUnitRequest,
	UpdateUnitResponse,
} from './types';


export const SLICE_NAME = 'inventory.unit';

export type UnitState = {
	detail: ReduxActionState<Unit>;
	list: ReduxActionState<Unit[]>;
	create: ReduxActionState<CreateUnitResponse>;
	update: ReduxActionState<UpdateUnitResponse>;
	delete: ReduxActionState<DeleteUnitResponse>;
};

const initialState: UnitState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listUnits = createAsyncThunk<
	SearchUnitsResponse,
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/list`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await unitService.listUnits();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list units';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getUnit = createAsyncThunk<
	Unit,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/detail`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await unitService.getUnit(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get unit';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createUnit = createAsyncThunk<
	CreateUnitResponse,
	CreateUnitRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await unitService.createUnit(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create unit';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateUnit = createAsyncThunk<
	UpdateUnitResponse,
	UpdateUnitRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/update`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await unitService.updateUnit(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update unit';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteUnit = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/delete`,
	async (id, { rejectWithValue }) => {
		try {
			await unitService.deleteUnit(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete unit';
			return rejectWithValue(errorMessage);
		}
	},
);

const unitSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setUnits: (state, action: PayloadAction<Unit[]>) => {
			state.list.data = action.payload;
		},
		resetCreateUnit: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateUnit: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteUnit: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listUnitsReducers(builder);
		getUnitReducers(builder);
		createUnitReducers(builder);
		updateUnitReducers(builder);
		deleteUnitReducers(builder);
	},
});

function listUnitsReducers(builder: ActionReducerMapBuilder<UnitState>) {
	builder
		.addCase(listUnits.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listUnits.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listUnits.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list units';
		});
}

function getUnitReducers(builder: ActionReducerMapBuilder<UnitState>) {
	builder
		.addCase(getUnit.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getUnit.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getUnit.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get unit';
		});
}

function createUnitReducers(builder: ActionReducerMapBuilder<UnitState>) {
	builder
		.addCase(createUnit.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createUnit.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createUnit.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create unit';
			state.create.data = undefined;
		});
}

function updateUnitReducers(builder: ActionReducerMapBuilder<UnitState>) {
	builder
		.addCase(updateUnit.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateUnit.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt =
					(action.payload.updatedAt as Date)?.toISOString?.()
					?? state.detail.data.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateUnit.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update unit';
			state.update.data = undefined;
		});
}

function deleteUnitReducers(builder: ActionReducerMapBuilder<UnitState>) {
	builder
		.addCase(deleteUnit.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteUnit.fulfilled, (state) => {
			state.delete.status = 'success';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteUnit.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete unit';
			state.delete.data = undefined;
		});
}

export const actions = {
	...unitSlice.actions,
};

export const { reducer } = unitSlice;