import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
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


export const SLICE_NAME = 'identity.organization';

export type OrganizationState = {
	detail: ReduxActionState<Organization>;
	list: ReduxActionState<Organization[]>;
	create: ReduxActionState<CreateOrganizationResponse>;
	update: ReduxActionState<UpdateOrganizationResponse>;
	delete: ReduxActionState<DeleteOrganizationResponse>;
};

const initialState: OrganizationState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
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
			state.list.data = action.payload;
		},
		resetCreateOrganization: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateOrganization: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteOrganization: (state) => {
			state.delete = baseReduxActionState;
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
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listOrganizations.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listOrganizations.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list organizations';
		});
}

function getOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(getOrganization.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getOrganization.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getOrganization.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get organization';
		});
}

function createOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(createOrganization.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createOrganization.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createOrganization.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create organization';
			state.create.data = undefined;
		});
}

function updateOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(updateOrganization.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateOrganization.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateOrganization.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update organization';
			state.update.data = undefined;
		});
}

function deleteOrganizationReducers(builder: ActionReducerMapBuilder<OrganizationState>) {
	builder
		.addCase(deleteOrganization.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteOrganization.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteOrganization.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete organization';
			state.delete.data = undefined;
		});
}

export const actions = {
	...organizationSlice.actions,
};

export const { reducer } = organizationSlice;
