import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { organizationService } from './organizationService';
import { CreateOrganizationResponse, Organization, UpdateOrganizationRequest } from './types';
import { CreateOrganizationRequest } from './types';


export const SLICE_NAME = 'identity.organization';

export type OrganizationState = {
	organizations: Organization[];
	isLoadingList: boolean;
	errorList: string | null;
	organizationDetail: Organization | undefined;
	createOrganizationResponse: CreateOrganizationResponse | null;
	isLoadingDetail: boolean;
	isCreatingOrganization: boolean;
	isUpdatingOrganization: boolean;
	isDeletingOrganization: boolean;
	errorDetail: string | null;
	createOrganizationError: string | null;
	updateOrganizationError: string | null;
	deleteOrganizationError: string | null;
};

const initialState: OrganizationState = {
	organizations: [],
	isLoadingList: false,
	errorList: null,
	organizationDetail: undefined,
	createOrganizationResponse: null,
	isLoadingDetail: false,
	isCreatingOrganization: false,
	isUpdatingOrganization: false,
	isDeletingOrganization: false,
	errorDetail: null,
	createOrganizationError: null,
	updateOrganizationError: null,
	deleteOrganizationError: null,
};

export const listOrganizations = createAsyncThunk<
	Organization[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchOrganizations`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await organizationService.listOrganizations();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list organizations';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getOrganization = createAsyncThunk<
	Organization | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchOrganization`,
	async (slug, { rejectWithValue }) => {
		try {
			const result = await organizationService.getOrganization(slug);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get organization';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createOrganization = createAsyncThunk<
	CreateOrganizationResponse,
	CreateOrganizationRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createOrganization`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await organizationService.createOrganization(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateOrganization = createAsyncThunk<
	Organization,
	UpdateOrganizationRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateOrganization`,
	async ({ slug, ...data }, { rejectWithValue }) => {
		try {
			const result = await organizationService.updateOrganization(slug, { slug, ...data });
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteOrganization = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteOrganization`,
	async (slug, { rejectWithValue }) => {
		try {
			await organizationService.deleteOrganization(slug);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete organization';
			return rejectWithValue(errorMessage);
		}
	},
);

const organizationSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setOrganizations: (state, action: PayloadAction<any[]>) => {
			state.organizations = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listOrganizationsReducers(builder);
		getOrganizationReducers(builder);
		createOrganizationReducers(builder);
		updateOrganizationReducers(builder);
		deleteOrganizationReducers(builder);
	},
});

function listOrganizationsReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(listOrganizations.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listOrganizations.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.organizations = action.payload;
			state.errorList = null;
		})
		.addCase(listOrganizations.rejected, (state, action) => {
			state.isLoadingList = false;
			state.organizations = [];
			state.errorList = action.payload || 'Failed to list organizations';
		});
}

function getOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(getOrganization.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getOrganization.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.organizationDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getOrganization.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.organizationDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get organization';
		});
}

function createOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(createOrganization.pending, (state) => {
			state.isCreatingOrganization = true;
			state.createOrganizationError = null;
		})
		.addCase(createOrganization.fulfilled, (state, action) => {
			state.isCreatingOrganization = false;
			state.createOrganizationResponse = action.payload;
			state.createOrganizationError = null;
		})
		.addCase(createOrganization.rejected, (state, action) => {
			state.isCreatingOrganization = false;
			state.createOrganizationError = action.payload || 'Failed to create organization';
		});
}

function updateOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(updateOrganization.pending, (state) => {
			state.isUpdatingOrganization = true;
			state.updateOrganizationError = null;
		})
		.addCase(updateOrganization.fulfilled, (state, action) => {
			state.isUpdatingOrganization = false;
			state.organizationDetail = action.payload;
			state.updateOrganizationError = null;
		})
		.addCase(updateOrganization.rejected, (state, action) => {
			state.isUpdatingOrganization = false;
			state.updateOrganizationError = action.payload || 'Failed to update organization';
		});
}

function deleteOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(deleteOrganization.pending, (state) => {
			state.isDeletingOrganization = true;
			state.deleteOrganizationError = null;
		})
		.addCase(deleteOrganization.fulfilled, (state) => {
			state.isDeletingOrganization = false;
			state.deleteOrganizationError = null;
		})
		.addCase(deleteOrganization.rejected, (state, action) => {
			state.isDeletingOrganization = false;
			state.deleteOrganizationError = action.payload || 'Failed to delete organization';
		});
}

export const actions = {
	...organizationSlice.actions,
};

export const { reducer } = organizationSlice;
