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


export const actions = {
	...resourceSlice.actions,
};

export const { reducer } = resourceSlice;

