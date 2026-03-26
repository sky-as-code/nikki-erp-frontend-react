import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { attributeService } from './attributeService';

import type {
	Attribute,
	CreateAttributeRequest,
	CreateAttributeResponse,
	UpdateAttributeRequest,
	UpdateAttributeResponse,
	DeleteAttributeResponse,
	SearchAttributesResponse,
} from './types';


export const SLICE_NAME = 'inventory.attribute';

export type AttributeState = {
	detail: ReduxActionState<Attribute>;
	list: ReduxActionState<Attribute[]>;
	create: ReduxActionState<CreateAttributeResponse>;
	update: ReduxActionState<UpdateAttributeResponse>;
	delete: ReduxActionState<DeleteAttributeResponse>;
};

const initialState: AttributeState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listAttributes = createAsyncThunk<
	SearchAttributesResponse,
	{ orgId: string; productId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchAttributes`,
	async ({ orgId, productId }, { rejectWithValue }) => {
		try {
			const result = await attributeService.listAttributes(orgId, productId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list attributes';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getAttribute = createAsyncThunk<
	Attribute,
	{ orgId: string; attributeId: string; productId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchAttribute`,
	async ({ orgId, attributeId, productId }, { rejectWithValue }) => {
		try {
			const result = await attributeService.getAttribute(orgId, productId, attributeId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get attribute';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createAttribute = createAsyncThunk<
	CreateAttributeResponse,
	{ orgId: string; data: CreateAttributeRequest },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createAttribute`,
	async ({ orgId, data }, { rejectWithValue }) => {
		try {
			const result = await attributeService.createAttribute(orgId, data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create attribute';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateAttribute = createAsyncThunk<
	UpdateAttributeResponse,
	{ orgId: string; productId: string; data: UpdateAttributeRequest },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateAttribute`,
	async ({ orgId, productId, data }, { rejectWithValue }) => {
		try {
			const result = await attributeService.updateAttribute(orgId, productId, data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update attribute';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteAttribute = createAsyncThunk<
	void,
	{ orgId: string; productId: string; attributeId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteAttribute`,
	async ({ orgId, productId, attributeId }, { rejectWithValue }) => {
		try {
			await attributeService.deleteAttribute(orgId, productId, attributeId);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete attribute';
			return rejectWithValue(errorMessage);
		}
	},
);

const attributeSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setAttributes: (state, action: PayloadAction<Attribute[]>) => {
			state.list.data = action.payload;
		},
		resetCreateAttribute: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateAttribute: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteAttribute: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listAttributesReducers(builder);
		getAttributeReducers(builder);
		createAttributeReducers(builder);
		updateAttributeReducers(builder);
		deleteAttributeReducers(builder);
	},
});

function listAttributesReducers(builder: ActionReducerMapBuilder<AttributeState>) {
	builder
		.addCase(listAttributes.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listAttributes.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listAttributes.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list attributes';
		});
}

function getAttributeReducers(builder: ActionReducerMapBuilder<AttributeState>) {
	builder
		.addCase(getAttribute.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getAttribute.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getAttribute.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get attribute';
		});
}

function createAttributeReducers(builder: ActionReducerMapBuilder<AttributeState>) {
	builder
		.addCase(createAttribute.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createAttribute.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createAttribute.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create attribute';
			state.create.data = undefined;
		});
}

function updateAttributeReducers(builder: ActionReducerMapBuilder<AttributeState>) {
	builder
		.addCase(updateAttribute.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateAttribute.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				if (action.payload.updatedAt) {
					const timestamp = typeof action.payload.updatedAt === 'number'
						? action.payload.updatedAt
						: new Date(action.payload.updatedAt).getTime();
					state.detail.data.updatedAt = timestamp;
				}
			}
			state.update.error = null;
		})
		.addCase(updateAttribute.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update attribute';
			state.update.data = undefined;
		});
}

function deleteAttributeReducers(builder: ActionReducerMapBuilder<AttributeState>) {
	builder
		.addCase(deleteAttribute.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteAttribute.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteAttribute.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete attribute';
			state.delete.data = undefined;
		});
}

export const actions = {
	...attributeSlice.actions,
};

export const { reducer } = attributeSlice;
