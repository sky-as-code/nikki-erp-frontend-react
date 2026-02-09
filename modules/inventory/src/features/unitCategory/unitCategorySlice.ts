import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	PayloadAction,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { unitCategoryService } from './unitCategoryService';

import type {
	CreateUnitCategoryRequest,
	CreateUnitCategoryResponse,
	DeleteUnitCategoryResponse,
	SearchUnitCategoriesResponse,
	UnitCategory,
	UpdateUnitCategoryRequest,
	UpdateUnitCategoryResponse,
} from './types';


export const SLICE_NAME = 'inventory.unitCategory';

export type UnitCategoryState = {
	list: ReduxActionState<UnitCategory[]>;
	create: ReduxActionState<CreateUnitCategoryResponse>;
	update: ReduxActionState<UpdateUnitCategoryResponse>;
	delete: ReduxActionState<DeleteUnitCategoryResponse>;
};

const initialState: UnitCategoryState = {
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listUnitCategories = createAsyncThunk<
	SearchUnitCategoriesResponse,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/list`,
	async (orgId, { rejectWithValue }) => {
		try {
			return await unitCategoryService.listUnitCategories(orgId);
		}
		catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Failed to list unit categories');
		}
	},
);

export const createUnitCategory = createAsyncThunk<
	CreateUnitCategoryResponse,
	CreateUnitCategoryRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (data, { rejectWithValue }) => {
		try {
			return await unitCategoryService.createUnitCategory(data);
		}
		catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Failed to create unit category');
		}
	},
);

export const updateUnitCategory = createAsyncThunk<
	UpdateUnitCategoryResponse,
	UpdateUnitCategoryRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/update`,
	async (data, { rejectWithValue }) => {
		try {
			return await unitCategoryService.updateUnitCategory(data);
		}
		catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Failed to update unit category');
		}
	},
);

export const deleteUnitCategory = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/delete`,
	async (id, { rejectWithValue }) => {
		try {
			await unitCategoryService.deleteUnitCategory(id);
		}
		catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete unit category');
		}
	},
);

const unitCategorySlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setUnitCategories: (state, action: PayloadAction<UnitCategory[]>) => {
			state.list.data = action.payload;
		},
		resetCreateUnitCategory: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateUnitCategory: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteUnitCategory: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listUnitCategoriesReducers(builder);
		createUnitCategoryReducers(builder);
		updateUnitCategoryReducers(builder);
		deleteUnitCategoryReducers(builder);
	},
});

function listUnitCategoriesReducers(builder: ActionReducerMapBuilder<UnitCategoryState>) {
	builder
		.addCase(listUnitCategories.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listUnitCategories.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listUnitCategories.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list unit categories';
		});
}

function createUnitCategoryReducers(builder: ActionReducerMapBuilder<UnitCategoryState>) {
	builder
		.addCase(createUnitCategory.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createUnitCategory.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createUnitCategory.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create unit category';
			state.create.data = undefined;
		});
}

function updateUnitCategoryReducers(builder: ActionReducerMapBuilder<UnitCategoryState>) {
	builder
		.addCase(updateUnitCategory.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateUnitCategory.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.error = null;
		})
		.addCase(updateUnitCategory.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update unit category';
			state.update.data = undefined;
		});
}

function deleteUnitCategoryReducers(builder: ActionReducerMapBuilder<UnitCategoryState>) {
	builder
		.addCase(deleteUnitCategory.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteUnitCategory.fulfilled, (state) => {
			state.delete.status = 'success';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteUnitCategory.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete unit category';
			state.delete.data = undefined;
		});
}

export const actions = {
	...unitCategorySlice.actions,
};

export const { reducer } = unitCategorySlice;
