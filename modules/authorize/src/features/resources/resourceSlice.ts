import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { resourceService } from './resourceService';
import { Resource } from './types';


export const SLICE_NAME = 'authorize.resource';

export type ResourceState = {
	resources: Resource[];
	isLoadingList: boolean;
	errorList: string | null;
	resourceDetail: Resource | undefined;
	isLoadingDetail: boolean;
	errorDetail: string | null;
};

const initialState: ResourceState = {
	resources: [],
	isLoadingList: false,
	errorList: null,
	resourceDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
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
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
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
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listResources.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.resources = action.payload;
			state.errorList = null;
		})
		.addCase(listResources.rejected, (state, action) => {
			state.isLoadingList = false;
			state.resources = [];
			state.errorList = action.payload || 'Failed to list resources';
		});
}

function getResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(getResource.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getResource.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.resourceDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getResource.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.resourceDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get resource';
		});
}

function createResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(createResource.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(createResource.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.resourceDetail = action.payload;
			state.resources.push(action.payload);
			state.errorDetail = null;
		})
		.addCase(createResource.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to create resource';
		});
}

function updateResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(updateResource.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(updateResource.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.resourceDetail = action.payload;
			const index = state.resources.findIndex((r) => r.id === action.payload.id);
			if (index >= 0) {
				state.resources[index] = action.payload;
			}
			state.errorDetail = null;
		})
		.addCase(updateResource.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to update resource';
		});
}

function deleteResourceReducers(builder: ActionReducerMapBuilder<ResourceState>) {
	builder
		.addCase(deleteResource.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(deleteResource.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.resources = state.resources.filter((r) => r.name !== action.meta.arg.name);
			if (state.resourceDetail?.name === action.meta.arg.name) {
				state.resourceDetail = undefined;
			}
			state.errorDetail = null;
		})
		.addCase(deleteResource.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to delete resource';
		});
}


export const actions = {
	...resourceSlice.actions,
};

export const { reducer } = resourceSlice;

