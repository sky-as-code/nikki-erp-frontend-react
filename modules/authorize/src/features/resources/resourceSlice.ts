import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { resourceService } from './resourceService';
import { Resource } from './types';
import {
	ReduxActionState,
	baseReduxActionState,
} from '../../appState/reduxActionState';


export const SLICE_NAME = 'authorize.resource';

export type ResourceState = {
	detail: ReduxActionState<Resource>;
	list: ReduxActionState<Resource[]>;
	create: ReduxActionState<Resource>;
	update: ReduxActionState<Resource>;
	delete: ReduxActionState<void>;
};

const initialState: ResourceState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listResources = createAsyncThunk<
	Resource[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listResources`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await resourceService.listResources();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list resources';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getResource = createAsyncThunk<
	Resource | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getResource`,
	async (name, { rejectWithValue }) => {
		try {
			const result = await resourceService.getResource(name);
			console.log('result', result);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get resource';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createResource = createAsyncThunk<
	Resource,
	Resource,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createResource`,
	async (resource, { rejectWithValue }) => {
		try {
			const result = await resourceService.createResource(resource);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create resource';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateResource = createAsyncThunk<
	Resource,
	{ id: string; etag: string; description?: string | null },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateResource`,
	async ({ id, etag, description }, { rejectWithValue }) => {
		try {
			const result = await resourceService.updateResource(id, etag, description);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update resource';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteResource = createAsyncThunk<
	void,
	{ name: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteResource`,
	async ({ name }, { rejectWithValue }) => {
		try {
			await resourceService.deleteResource(name);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete resource';
			return rejectWithValue(errorMessage);
		}
	},
);

const resourceSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setResources: (state, action: PayloadAction<Resource[]>) => {
			state.list.data = action.payload;
		},
		resetCreateResource: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateResource: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteResource: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listResourcesReducers(builder);
		getResourceReducers(builder);
		createResourceReducers(builder);
		updateResourceReducers(builder);
		deleteResourceReducers(builder);
	},
});

function listResourcesReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(listResources.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listResources.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			// state.resources = action.payload;
			state.list.error = null;
		})
		.addCase(listResources.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list resources';
			state.list.data = [];
			// state.resources = [];
		});
}

function getResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(getResource.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
			// state.resourceDetail = undefined;
		})
		.addCase(getResource.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			// state.resourceDetail = action.payload;
		})
		.addCase(getResource.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get resource';
			state.detail.data = undefined;
			// state.resourceDetail = undefined;
		});
}

function createResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(createResource.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createResource.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			// state.resources.push(action.payload);
		})
		.addCase(createResource.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create resource';
		});
}

function updateResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(updateResource.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateResource.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			// state.resourceDetail = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((r) => r.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
			/* const index = state.list.data?.findIndex((r) => r.id === action.payload.id) ?? -1;
			if (index >= 0) {
				state.list.data[index] = action.payload;
			} */
		})
		.addCase(updateResource.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update resource';
		});
}

function deleteResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(deleteResource.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteResource.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((r) => r.name !== action.meta.arg.name);
			}
			state.list.data = state.list.data?.filter((r) => r.name !== action.meta.arg.name) ?? [];
			if (state.detail.data?.name === action.meta.arg.name) {
				state.detail.data = undefined;
			}
			if (state.detail.data?.name === action.meta.arg.name) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteResource.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete resource';
		});
}


export const actions = {
	...resourceSlice.actions,
};

export const { reducer } = resourceSlice;

