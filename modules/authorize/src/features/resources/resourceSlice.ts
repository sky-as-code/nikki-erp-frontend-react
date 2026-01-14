import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { resourceService } from './resourceService';
import { Resource } from './types';
import { ReduxActionState, createInitialReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'authorize.resource';

export type ResourceState = {
	resources: Resource[];
	resourceDetail?: Resource;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<Resource>;
	update: ReduxActionState<Resource>;
	delete: ReduxActionState<void>;
};

const initialState: ResourceState = {
	resources: [],
	resourceDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: createInitialReduxActionState(),
	update: createInitialReduxActionState(),
	delete: createInitialReduxActionState(),
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
	async (id, { rejectWithValue }) => {
		try {
			const result = await resourceService.getResource(id);
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
	Omit<Resource, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>,
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
			state.resources = action.payload;
		},
		resetCreateResource: (state) => {
			state.create = createInitialReduxActionState();
		},
		resetUpdateResource: (state) => {
			state.update = createInitialReduxActionState();
		},
		resetDeleteResource: (state) => {
			state.delete = createInitialReduxActionState();
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
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listResources.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.resources = action.payload;
			state.list.error = null;
		})
		.addCase(listResources.rejected, (state, action) => {
			state.list.isLoading = false;
			state.resources = [];
			state.list.error = action.payload || 'Failed to list resources';
		});
}

function getResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(getResource.pending, (state) => {
			state.resourceDetail = undefined;
		})
		.addCase(getResource.fulfilled, (state, action) => {
			state.resourceDetail = action.payload;
		})
		.addCase(getResource.rejected, (state) => {
			state.resourceDetail = undefined;
		});
}

function createResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(createResource.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createResource.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.resources.push(action.payload);
		})
		.addCase(createResource.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create resource';
		});
}

function updateResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(updateResource.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateResource.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.resourceDetail = action.payload;
			const index = state.resources.findIndex((r) => r.id === action.payload.id);
			if (index >= 0) {
				state.resources[index] = action.payload;
			}
		})
		.addCase(updateResource.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update resource';
		});
}

function deleteResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(deleteResource.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteResource.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.resources = state.resources.filter((r) => r.name !== action.meta.arg.name);
			if (state.resourceDetail?.name === action.meta.arg.name) {
				state.resourceDetail = undefined;
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

