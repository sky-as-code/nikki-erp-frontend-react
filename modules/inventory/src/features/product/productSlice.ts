import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { productService } from './productService';

import type {
	Product,
	CreateProductRequest,
	CreateProductResponse,
	UpdateProductRequest,
	UpdateProductResponse,
	DeleteProductResponse,
	SearchProductsResponse,
} from './types';


export const SLICE_NAME = 'inventory.product';

export type ProductState = {
	detail: ReduxActionState<Product>;
	list: ReduxActionState<Product[]>;
	create: ReduxActionState<CreateProductResponse>;
	update: ReduxActionState<UpdateProductResponse>;
	delete: ReduxActionState<DeleteProductResponse>;
};

const initialState: ProductState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listProducts = createAsyncThunk<
	SearchProductsResponse,
	{ orgId: string; categoryId?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchProducts`,
	async ({ orgId, categoryId }, { rejectWithValue }) => {
		try {
			const result = await productService.listProducts(orgId, categoryId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list products';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getProduct = createAsyncThunk<
	Product,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchProduct`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await productService.getProduct(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get product';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createProduct = createAsyncThunk<
	CreateProductResponse,
	CreateProductRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createProduct`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await productService.createProduct(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateProduct = createAsyncThunk<
	UpdateProductResponse,
	UpdateProductRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateProduct`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await productService.updateProduct(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteProduct = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteProduct`,
	async (id, { rejectWithValue }) => {
		try {
			await productService.deleteProduct(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
			return rejectWithValue(errorMessage);
		}
	},
);

const productSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setProducts: (state, action: PayloadAction<Product[]>) => {
			state.list.data = action.payload;
		},
		resetCreateProduct: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateProduct: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteProduct: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listProductsReducers(builder);
		getProductReducers(builder);
		createProductReducers(builder);
		updateProductReducers(builder);
		deleteProductReducers(builder);
	},
});

function listProductsReducers(builder: ActionReducerMapBuilder<ProductState>) {
	builder
		.addCase(listProducts.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listProducts.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listProducts.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list products';
		});
}

function getProductReducers(builder: ActionReducerMapBuilder<ProductState>) {
	builder
		.addCase(getProduct.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getProduct.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getProduct.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get product';
		});
}

function createProductReducers(builder: ActionReducerMapBuilder<ProductState>) {
	builder
		.addCase(createProduct.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createProduct.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createProduct.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create product';
			state.create.data = undefined;
		});
}

function updateProductReducers(builder: ActionReducerMapBuilder<ProductState>) {
	builder
		.addCase(updateProduct.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateProduct.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt =
					(action.payload.updatedAt as Date)?.toISOString?.()
					?? state.detail.data.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateProduct.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update product';
			state.update.data = undefined;
		});
}

function deleteProductReducers(builder: ActionReducerMapBuilder<ProductState>) {
	builder
		.addCase(deleteProduct.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteProduct.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteProduct.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete product';
			state.delete.data = undefined;
		});
}

export const actions = {
	...productSlice.actions,
};

export const { reducer } = productSlice;
