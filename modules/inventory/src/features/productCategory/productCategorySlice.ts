import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	PayloadAction,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { productCategoryService } from './productCategoryService';

import type {
	CreateProductCategoryRequest,
	CreateProductCategoryResponse,
	DeleteProductCategoryResponse,
	ProductCategory,
	SearchProductCategoriesResponse,
	UpdateProductCategoryRequest,
	UpdateProductCategoryResponse,
} from './types';


export const SLICE_NAME = 'inventory.productCategory';

export type ProductCategoryState = {
	list: ReduxActionState<ProductCategory[]>;
	create: ReduxActionState<CreateProductCategoryResponse>;
	update: ReduxActionState<UpdateProductCategoryResponse>;
	delete: ReduxActionState<DeleteProductCategoryResponse>;
};

const initialState: ProductCategoryState = {
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listProductCategories = createAsyncThunk<
	SearchProductCategoriesResponse,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/list`,
	async (orgId, { rejectWithValue }) => {
		try {
			const result = await productCategoryService.listProductCategories(orgId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list categories';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createProductCategory = createAsyncThunk<
	CreateProductCategoryResponse,
	CreateProductCategoryRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await productCategoryService.createProductCategory(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateProductCategory = createAsyncThunk<
	UpdateProductCategoryResponse,
	UpdateProductCategoryRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/update`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await productCategoryService.updateProductCategory(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteProductCategory = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/delete`,
	async (id, { rejectWithValue }) => {
		try {
			await productCategoryService.deleteProductCategory(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
			return rejectWithValue(errorMessage);
		}
	},
);

const productCategorySlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setProductCategories: (state, action: PayloadAction<ProductCategory[]>) => {
			state.list.data = action.payload;
		},
		resetCreateProductCategory: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateProductCategory: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteProductCategory: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listProductCategoriesReducers(builder);
		createProductCategoryReducers(builder);
		updateProductCategoryReducers(builder);
		deleteProductCategoryReducers(builder);
	},
});

function listProductCategoriesReducers(builder: ActionReducerMapBuilder<ProductCategoryState>) {
	builder
		.addCase(listProductCategories.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listProductCategories.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listProductCategories.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list categories';
		});
}

function createProductCategoryReducers(builder: ActionReducerMapBuilder<ProductCategoryState>) {
	builder
		.addCase(createProductCategory.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createProductCategory.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createProductCategory.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create category';
			state.create.data = undefined;
		});
}

function updateProductCategoryReducers(builder: ActionReducerMapBuilder<ProductCategoryState>) {
	builder
		.addCase(updateProductCategory.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateProductCategory.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.error = null;
		})
		.addCase(updateProductCategory.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update category';
			state.update.data = undefined;
		});
}

function deleteProductCategoryReducers(builder: ActionReducerMapBuilder<ProductCategoryState>) {
	builder
		.addCase(deleteProductCategory.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteProductCategory.fulfilled, (state) => {
			state.delete.status = 'success';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteProductCategory.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete category';
			state.delete.data = undefined;
		});
}

export const actions = {
	...productCategorySlice.actions,
};

export const { reducer } = productCategorySlice;
