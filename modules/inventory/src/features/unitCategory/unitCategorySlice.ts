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
	detail: ReduxActionState<UnitCategory>;
	list: ReduxActionState<UnitCategory[]>;
	create: ReduxActionState<CreateUnitCategoryResponse>;
	update: ReduxActionState<UpdateUnitCategoryResponse>;
	delete: ReduxActionState<DeleteUnitCategoryResponse>;
};

const initialState: UnitCategoryState = {
	detail: baseReduxActionState,
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

export const getUnitCategory = createAsyncThunk<
	UnitCategory,
	{ orgId: string; id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/detail`,
	async ({ orgId, id }, { rejectWithValue }) => {
		try {
			const result = await unitCategoryService.getUnitCategory(orgId, id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get unit category';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createUnitCategory = createAsyncThunk<
	CreateUnitCategoryResponse,
	{ orgId: string; data: CreateUnitCategoryRequest },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async ({ orgId, data }, { rejectWithValue }) => {
		try {
			const result = await unitCategoryService.createUnitCategory(orgId, data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create unit category';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateUnitCategory = createAsyncThunk<
	UpdateUnitCategoryResponse,
	{ orgId: string; data: UpdateUnitCategoryRequest },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/update`,
	async ({ orgId, data }, { rejectWithValue }) => {
		try {
			const result = await unitCategoryService.updateUnitCategory(orgId, data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update unit category';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteUnitCategory = createAsyncThunk<
	void,
	{ orgId: string; id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/delete`,
	async ({ orgId, id }, { rejectWithValue }) => {
		try {
			await unitCategoryService.deleteUnitCategory(orgId, id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete unit category';
			return rejectWithValue(errorMessage);
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
		resetDetailUnitCategory: (state) => {
			state.detail = baseReduxActionState;
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
		getUnitCategoryReducers(builder);
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

function getUnitCategoryReducers(builder: ActionReducerMapBuilder<UnitCategoryState>) {
	builder
		.addCase(getUnitCategory.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getUnitCategory.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getUnitCategory.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get unit category';
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
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				const updatedAt = action.payload.updatedAt;
				if (updatedAt instanceof Date) {
					state.detail.data.updatedAt = updatedAt.toString();
				}
				else if (typeof updatedAt === 'string') {
					state.detail.data.updatedAt = updatedAt;
				}
			}
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
