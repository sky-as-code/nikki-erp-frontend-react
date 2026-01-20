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
	ManageHierarchyLevelUsersRequest,
	ManageHierarchyLevelUsersResponse,
	UpdateHierarchyLevelResponse,
	SearchHierarchyLevelResponse,
	DeleteHierarchyLevelResponse,
} from './types';
import { initialReduxActionState, ReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'identity.hierarchy';

export type HierarchyState = {
	hierarchies: HierarchyLevel[];
	hierarchyDetail?: HierarchyLevel;
	isLoading: boolean;
	error: string | null;
	create: ReduxActionState<CreateHierarchyLevelResponse>;
	update: ReduxActionState<UpdateHierarchyLevelResponse>;
	delete: ReduxActionState<DeleteHierarchyLevelResponse>;
	manageUsers: ReduxActionState<ManageHierarchyLevelUsersResponse>;
};

const initialState: HierarchyState = {
	hierarchies: [],
	hierarchyDetail: undefined,
	isLoading: false,
	error: null,
	create: initialReduxActionState<CreateHierarchyLevelResponse>(),
	update: initialReduxActionState<UpdateHierarchyLevelResponse>(),
	delete: initialReduxActionState<DeleteHierarchyLevelResponse>(),
	manageUsers: initialReduxActionState<ManageHierarchyLevelUsersResponse>(),
};

export const listHierarchies = createAsyncThunk<
	SearchHierarchyLevelResponse,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchHierarchies`,
	async (orgId, { rejectWithValue }) => {
		try {
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
	HierarchyLevel,
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
	CreateHierarchyLevelRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createHierarchy`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.createHierarchy(data);
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
	UpdateHierarchyLevelResponse,
	UpdateHierarchyLevelRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateHierarchy`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.updateHierarchy(data);
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
	ManageHierarchyLevelUsersResponse,
	ManageHierarchyLevelUsersRequest,
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
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		resetCreateHierarchy: (state) => {
			state.create = initialReduxActionState<CreateHierarchyLevelResponse>();
		},
		resetUpdateHierarchy: (state) => {
			state.update = initialReduxActionState<UpdateHierarchyLevelResponse>();
		},
		resetDeleteHierarchy: (state) => {
			state.delete = initialReduxActionState<DeleteHierarchyLevelResponse>();
		},
		resetManageUsers: (state) => {
			state.manageUsers = initialReduxActionState<ManageHierarchyLevelUsersResponse>();
		},
	},
	extraReducers: (builder) => {
		listHierarchiesReducers(builder);
		getHierarchyReducers(builder);
		createHierarchyReducers(builder);
		updateHierarchyReducers(builder);
		deleteHierarchyReducers(builder);
		manageUsersReducers(builder);
	},
});

function listHierarchiesReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(listHierarchies.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(listHierarchies.fulfilled, (state, action) => {
			state.isLoading = false;
			state.hierarchies = action.payload.items;
			state.error = null;
		})
		.addCase(listHierarchies.rejected, (state, action) => {
			state.isLoading = false;
			state.hierarchies = [];
			state.error = action.payload || 'Failed to list hierarchies';
		});
}

function getHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(getHierarchy.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(getHierarchy.fulfilled, (state, action) => {
			state.isLoading = false;
			state.hierarchyDetail = action.payload;
			state.error = null;
		})
		.addCase(getHierarchy.rejected, (state, action) => {
			state.isLoading = false;
			state.hierarchyDetail = undefined;
			state.error = action.payload || 'Failed to get hierarchy';
		});
}

function createHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(createHierarchy.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createHierarchy.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createHierarchy.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create hierarchy';
		});
}

function updateHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(updateHierarchy.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateHierarchy.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.hierarchyDetail) {
				state.hierarchyDetail.etag = action.payload.etag;
				state.hierarchyDetail.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateHierarchy.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update hierarchy';
		});
}

function deleteHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(deleteHierarchy.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteHierarchy.fulfilled, (state) => {
			state.delete.status = 'success';
			state.hierarchyDetail = undefined;
			state.delete.error = null;
		})
		.addCase(deleteHierarchy.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete hierarchy';
		});
}

function manageUsersReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(manageHierarchyUsers.pending, (state) => {
			state.manageUsers.status = 'pending';
			state.manageUsers.error = null;
		})
		.addCase(manageHierarchyUsers.fulfilled, (state, action) => {
			state.manageUsers.status = 'success';
			if (state.hierarchyDetail) {
				state.hierarchyDetail.etag = action.payload.etag;
				state.hierarchyDetail.updatedAt = action.payload.updatedAt;
			}
			state.manageUsers.error = null;
		})
		.addCase(manageHierarchyUsers.rejected, (state, action) => {
			state.manageUsers.status = 'error';
			state.manageUsers.error = action.payload || 'Failed to manage users in hierarchy';
		});
}


export const actions = {
	...hierarchySlice.actions,
};

export const { reducer } = hierarchySlice;