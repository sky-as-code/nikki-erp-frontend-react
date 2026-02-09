import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { variantService } from './variantService';

import type {
	Variant,
	CreateVariantRequest,
	CreateVariantResponse,
	UpdateVariantRequest,
	UpdateVariantResponse,
	DeleteVariantResponse,
	SearchVariantsResponse,
} from './types';


export const SLICE_NAME = 'inventory.variant';

export type VariantState = {
	detail: ReduxActionState<Variant>;
	list: ReduxActionState<Variant[]>;
	create: ReduxActionState<CreateVariantResponse>;
	update: ReduxActionState<UpdateVariantResponse>;
	delete: ReduxActionState<DeleteVariantResponse>;
};

const initialState: VariantState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listVariants = createAsyncThunk<
	SearchVariantsResponse,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchVariants`,
	async (productId, { rejectWithValue }) => {
		try {
			const result = await variantService.listVariants(productId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list variants';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getVariant = createAsyncThunk<
	Variant,
	{ variantId: string; productId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchVariant`,
	async ({ variantId, productId }, { rejectWithValue }) => {
		try {
			const result = await variantService.getVariant(variantId, productId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get variant';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createVariant = createAsyncThunk<
	CreateVariantResponse,
	CreateVariantRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createVariant`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await variantService.createVariant(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create variant';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateVariant = createAsyncThunk<
	UpdateVariantResponse,
	{ productId: string; data: UpdateVariantRequest },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateVariant`,
	async ({ productId, data }, { rejectWithValue }) => {
		try {
			const result = await variantService.updateVariant(productId, data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update variant';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteVariant = createAsyncThunk<
	void,
	{ productId: string; variantId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteVariant`,
	async ({ productId, variantId }, { rejectWithValue }) => {
		try {
			await variantService.deleteVariant(productId, variantId);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete variant';
			return rejectWithValue(errorMessage);
		}
	},
);

export const listAllVariants = createAsyncThunk<
	SearchVariantsResponse,
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchAllVariants`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await variantService.listAllVariants();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list all variants';
			return rejectWithValue(errorMessage);
		}
	},
);

const variantSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setVariants: (state, action: PayloadAction<Variant[]>) => {
			state.list.data = action.payload;
		},
		resetCreateVariant: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateVariant: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteVariant: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listVariantsReducers(builder);
		listAllVariantsReducers(builder);
		getVariantReducers(builder);
		createVariantReducers(builder);
		updateVariantReducers(builder);
		deleteVariantReducers(builder);
	},
});

function listVariantsReducers(builder: ActionReducerMapBuilder<VariantState>) {
	builder
		.addCase(listVariants.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listVariants.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listVariants.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list variants';
		});
}

function listAllVariantsReducers(builder: ActionReducerMapBuilder<VariantState>) {
	builder
		.addCase(listAllVariants.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listAllVariants.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listAllVariants.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list all variants';
		});
}

function getVariantReducers(builder: ActionReducerMapBuilder<VariantState>) {
	builder
		.addCase(getVariant.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getVariant.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getVariant.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get variant';
		});
}

function createVariantReducers(builder: ActionReducerMapBuilder<VariantState>) {
	builder
		.addCase(createVariant.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createVariant.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createVariant.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create variant';
			state.create.data = undefined;
		});
}

function updateVariantReducers(builder: ActionReducerMapBuilder<VariantState>) {
	builder
		.addCase(updateVariant.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateVariant.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt =
					(action.payload.updatedAt as Date)?.toISOString?.()
					?? state.detail.data.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateVariant.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update variant';
			state.update.data = undefined;
		});
}

function deleteVariantReducers(builder: ActionReducerMapBuilder<VariantState>) {
	builder
		.addCase(deleteVariant.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteVariant.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteVariant.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete variant';
			state.delete.data = undefined;
		});
}

export const actions = {
	...variantSlice.actions,
};

export const { reducer } = variantSlice;
