import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { organizationService } from './organizationService';
import {
	CreateOrganizationResponse,
	Organization,
	SearchOrganizationResponse,
	UpdateOrganizationRequest,
	UpdateOrganizationResponse,
	DeleteOrganizationResponse,
} from './types';
import { CreateOrganizationRequest } from './types';
import { initialReduxActionState, ReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'identity.organization';

export type OrganizationState = {
	organizations: Organization[];
	organizationDetail?: Organization;
	isLoading: boolean;
	error: string | null;
	create: ReduxActionState<CreateOrganizationResponse>;
	update: ReduxActionState<UpdateOrganizationResponse>;
	delete: ReduxActionState<DeleteOrganizationResponse>;
};

const initialState: OrganizationState = {
	organizations: [],
	organizationDetail: undefined,
	isLoading: false,
	error: null,
	create: initialReduxActionState<CreateOrganizationResponse>(),
	update: initialReduxActionState<UpdateOrganizationResponse>(),
	delete: initialReduxActionState<DeleteOrganizationResponse>(),
};

export const listOrganizations = createAsyncThunk<
	SearchOrganizationResponse,
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
	Organization,
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
	UpdateOrganizationResponse,
	UpdateOrganizationRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateOrganization`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await organizationService.updateOrganization(data);
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
		setOrganizations: (state, action: PayloadAction<Organization[]>) => {
			state.organizations = action.payload;
		},
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		resetCreateOrganization: (state) => {
			state.create = initialReduxActionState<CreateOrganizationResponse>();
		},
		resetUpdateOrganization: (state) => {
			state.update = initialReduxActionState<UpdateOrganizationResponse>();
		},
		resetDeleteOrganization: (state) => {
			state.delete = initialReduxActionState<DeleteOrganizationResponse>();
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
			state.isLoading = true;
			state.error = null;
		})
		.addCase(listOrganizations.fulfilled, (state, action) => {
			state.isLoading = false;
			state.organizations = action.payload.items;
			state.error = null;
		})
		.addCase(listOrganizations.rejected, (state, action) => {
			state.isLoading = false;
			state.organizations = [];
			state.error = action.payload || 'Failed to list organizations';
		});
}

function getOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(getOrganization.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(getOrganization.fulfilled, (state, action) => {
			state.isLoading = false;
			state.organizationDetail = action.payload;
			state.error = null;
		})
		.addCase(getOrganization.rejected, (state, action) => {
			state.isLoading = false;
			state.organizationDetail = undefined;
			state.error = action.payload || 'Failed to get organization';
		});
}

function createOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(createOrganization.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createOrganization.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createOrganization.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create organization';
		});
}

function updateOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(updateOrganization.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateOrganization.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.organizationDetail) {
				state.organizationDetail.etag = action.payload.etag;
				state.organizationDetail.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateOrganization.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update organization';
		});
}

function deleteOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(deleteOrganization.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteOrganization.fulfilled, (state) => {
			state.delete.status = 'success';
			state.organizationDetail = undefined;
			state.delete.error = null;
		})
		.addCase(deleteOrganization.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete organization';
		});
}

export const actions = {
	...organizationSlice.actions,
};

export const { reducer } = organizationSlice;
