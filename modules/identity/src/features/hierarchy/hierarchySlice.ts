import { selectMyOrgIdBySlug } from '@nikkierp/shell/userContext';
import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import { hierarchyService } from './hierarchyService';
import {
	HierarchyLevel,
	CreateHierarchyLevelRequest,
	CreateHierarchyLevelResponse,
	UpdateHierarchyLevelRequest,
	ManageHierarchyUsersRequest,
	ManageHierarchyUsersResponse,
} from './types';


export const SLICE_NAME = 'identity.hierarchy';

export type HierarchyState = {
	hierarchies: HierarchyLevel[];
	isLoadingList: boolean;
	errorList: string | null;
	hierarchyDetail: HierarchyLevel | undefined;
	createHierarchyResponse: CreateHierarchyLevelResponse | null;
	isLoadingDetail: boolean;
	isCreatingHierarchy: boolean;
	isUpdatingHierarchy: boolean;
	isDeletingHierarchy: boolean;
	isManagingUsers: boolean;
	errorDetail: string | null;
	createHierarchyError: string | null;
	updateHierarchyError: string | null;
	deleteHierarchyError: string | null;
	manageUsersError: string | null;
};

const initialState: HierarchyState = {
	hierarchies: [],
	isLoadingList: false,
	errorList: null,
	hierarchyDetail: undefined,
	createHierarchyResponse: null,
	isLoadingDetail: false,
	isCreatingHierarchy: false,
	isUpdatingHierarchy: false,
	isDeletingHierarchy: false,
	isManagingUsers: false,
	errorDetail: null,
	createHierarchyError: null,
	updateHierarchyError: null,
	deleteHierarchyError: null,
	manageUsersError: null,
};

export const listHierarchies = createAsyncThunk<
	HierarchyLevel[],
	string,
	{ rejectValue: string, state: any }
>(
	`${SLICE_NAME}/fetchHierarchies`,
	async (orgSlug, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const orgId = selectMyOrgIdBySlug(state, orgSlug);

			if (!orgId) {
				return rejectWithValue('Organization not found');
			}

			const result = await hierarchyService.listHierarchies(orgId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list hierarchies';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getHierarchy = createAsyncThunk<
	HierarchyLevel | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchHierarchy`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.getHierarchy(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get hierarchy';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createHierarchy = createAsyncThunk<
	CreateHierarchyLevelResponse,
	{ orgSlug: string, data: CreateHierarchyLevelRequest },
	{ rejectValue: string, state: any }
>(
	`${SLICE_NAME}/createHierarchy`,
	async ({ orgSlug, data }, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const orgId = selectMyOrgIdBySlug(state, orgSlug);

			if (!orgId) {
				return rejectWithValue('Organization not found');
			}

			const dataWithOrg = { ...data, orgId };
			const result = await hierarchyService.createHierarchy(dataWithOrg);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create hierarchy';
			console.error('Create hierarchy error:', error);
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateHierarchy = createAsyncThunk<
	HierarchyLevel,
	{ id: string } & Partial<HierarchyLevel>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateHierarchy`,
	async ({ id, ...data }, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.updateHierarchy(id, data as UpdateHierarchyLevelRequest);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update hierarchy';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteHierarchy = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteHierarchy`,
	async (id, { rejectWithValue }) => {
		try {
			await hierarchyService.deleteHierarchy(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete hierarchy';
			return rejectWithValue(errorMessage);
		}
	},
);

export const manageHierarchyUsers = createAsyncThunk<
	ManageHierarchyUsersResponse,
	ManageHierarchyUsersRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/manageHierarchyUsers`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.manageHierarchyUsers(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to manage hierarchy users';
			return rejectWithValue(errorMessage);
		}
	},
);

const hierarchySlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setHierarchies: (state, action: PayloadAction<HierarchyLevel[]>) => {
			state.hierarchies = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listHierarchiesReducers(builder);
		getHierarchyReducers(builder);
		createHierarchyReducers(builder);
		updateHierarchyReducers(builder);
		deleteHierarchyReducers(builder);
		manageHierarchyUsersReducers(builder);
	},
});

function listHierarchiesReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(listHierarchies.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listHierarchies.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.hierarchies = action.payload;
			state.errorList = null;
		})
		.addCase(listHierarchies.rejected, (state, action) => {
			state.isLoadingList = false;
			state.hierarchies = [];
			state.errorList = action.payload || 'Failed to list hierarchies';
		});
}

function getHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(getHierarchy.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getHierarchy.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.hierarchyDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getHierarchy.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.hierarchyDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get hierarchy';
		});
}

function createHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(createHierarchy.pending, (state) => {
			state.isCreatingHierarchy = true;
			state.createHierarchyError = null;
		})
		.addCase(createHierarchy.fulfilled, (state, action) => {
			state.isCreatingHierarchy = false;
			state.createHierarchyResponse = action.payload;
			state.createHierarchyError = null;
		})
		.addCase(createHierarchy.rejected, (state, action) => {
			state.isCreatingHierarchy = false;
			state.createHierarchyError = action.payload || 'Failed to create hierarchy';
		});
}

function updateHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(updateHierarchy.pending, (state) => {
			state.isUpdatingHierarchy = true;
			state.updateHierarchyError = null;
		})
		.addCase(updateHierarchy.fulfilled, (state, action) => {
			state.isUpdatingHierarchy = false;
			state.hierarchyDetail = action.payload;
			state.updateHierarchyError = null;
		})
		.addCase(updateHierarchy.rejected, (state, action) => {
			state.isUpdatingHierarchy = false;
			state.updateHierarchyError = action.payload || 'Failed to update hierarchy';
		});
}

function deleteHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(deleteHierarchy.pending, (state) => {
			state.isDeletingHierarchy = true;
			state.deleteHierarchyError = null;
		})
		.addCase(deleteHierarchy.fulfilled, (state) => {
			state.isDeletingHierarchy = false;
			state.hierarchyDetail = undefined;
			state.deleteHierarchyError = null;
		})
		.addCase(deleteHierarchy.rejected, (state, action) => {
			state.isDeletingHierarchy = false;
			state.deleteHierarchyError = action.payload || 'Failed to delete hierarchy';
		});
}

function manageHierarchyUsersReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(manageHierarchyUsers.pending, (state) => {
			state.isManagingUsers = true;
			state.manageUsersError = null;
		})
		.addCase(manageHierarchyUsers.fulfilled, (state) => {
			state.isManagingUsers = false;
			state.manageUsersError = null;
		})
		.addCase(manageHierarchyUsers.rejected, (state, action) => {
			state.isManagingUsers = false;
			state.manageUsersError = action.payload || 'Failed to manage hierarchy users';
		});
}

export const actions = {
	...hierarchySlice.actions,
};

export const { reducer } = hierarchySlice;