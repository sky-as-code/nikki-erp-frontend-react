import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	PayloadAction,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { attributeValueService } from './attributeValueService';

import type {
	AttributeValue,
	CreateAttributeValueRequest,
	CreateAttributeValueResponse,
	DeleteAttributeValueResponse,
	SearchAttributeValuesResponse,
	UpdateAttributeValueRequest,
	UpdateAttributeValueResponse,
} from './types';


export const SLICE_NAME = 'inventory.attributeValue';

export type AttributeValueState = {
	detail: ReduxActionState<AttributeValue>;
	list: ReduxActionState<AttributeValue[]>;
	create: ReduxActionState<CreateAttributeValueResponse>;
	update: ReduxActionState<UpdateAttributeValueResponse>;
	delete: ReduxActionState<DeleteAttributeValueResponse>;
};

const initialState: AttributeValueState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listAttributeValues = createAsyncThunk<
	SearchAttributeValuesResponse,
	string | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchAttributeValues`,
	async (attributeId, { rejectWithValue }) => {
		try {
			const result = await attributeValueService.listAttributeValues(attributeId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list attribute values';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getAttributeValue = createAsyncThunk<
	AttributeValue,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchAttributeValue`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await attributeValueService.getAttributeValue(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get attribute value';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createAttributeValue = createAsyncThunk<
	CreateAttributeValueResponse,
	CreateAttributeValueRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createAttributeValue`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await attributeValueService.createAttributeValue(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create attribute value';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateAttributeValue = createAsyncThunk<
	UpdateAttributeValueResponse,
	UpdateAttributeValueRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateAttributeValue`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await attributeValueService.updateAttributeValue(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update attribute value';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteAttributeValue = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteAttributeValue`,
	async (id, { rejectWithValue }) => {
		try {
			await attributeValueService.deleteAttributeValue(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete attribute value';
			return rejectWithValue(errorMessage);
		}
	},
);

const attributeValueSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setAttributeValues: (state, action: PayloadAction<AttributeValue[]>) => {
			state.list.data = action.payload;
		},
		resetCreateAttributeValue: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateAttributeValue: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteAttributeValue: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listAttributeValuesReducers(builder);
		getAttributeValueReducers(builder);
		createAttributeValueReducers(builder);
		updateAttributeValueReducers(builder);
		deleteAttributeValueReducers(builder);
	},
});

function listAttributeValuesReducers(builder: ActionReducerMapBuilder<AttributeValueState>) {
	builder
		.addCase(listAttributeValues.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listAttributeValues.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listAttributeValues.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list attribute values';
		});
}

function getAttributeValueReducers(builder: ActionReducerMapBuilder<AttributeValueState>) {
	builder
		.addCase(getAttributeValue.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getAttributeValue.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getAttributeValue.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get attribute value';
		});
}

function createAttributeValueReducers(builder: ActionReducerMapBuilder<AttributeValueState>) {
	builder
		.addCase(createAttributeValue.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createAttributeValue.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createAttributeValue.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create attribute value';
			state.create.data = undefined;
		});
}

function updateAttributeValueReducers(builder: ActionReducerMapBuilder<AttributeValueState>) {
	builder
		.addCase(updateAttributeValue.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateAttributeValue.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt =
					(action.payload.updatedAt as Date)?.toISOString?.()
					?? state.detail.data.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateAttributeValue.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update attribute value';
			state.update.data = undefined;
		});
}

function deleteAttributeValueReducers(builder: ActionReducerMapBuilder<AttributeValueState>) {
	builder
		.addCase(deleteAttributeValue.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteAttributeValue.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteAttributeValue.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete attribute value';
			state.delete.data = undefined;
		});
}

export const actions = {
	...attributeValueSlice.actions,
};

export const { reducer } = attributeValueSlice;
