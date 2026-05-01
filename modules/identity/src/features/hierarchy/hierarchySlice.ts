import { baseReduxThunkState, ReduxThunkState } from '@nikkierp/ui/appState';
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


export const SLICE_NAME = 'identity.hierarchy';

export type HierarchyState = {
	detail: ReduxThunkState<HierarchyLevel>;
	list: ReduxThunkState<HierarchyLevel[]>;
	create: ReduxThunkState<CreateHierarchyLevelResponse>;
	update: ReduxThunkState<UpdateHierarchyLevelResponse>;
	delete: ReduxThunkState<DeleteHierarchyLevelResponse>;
	manageUsers: ReduxThunkState<ManageHierarchyLevelUsersResponse>;
};

export const initialState: HierarchyState = {
	detail: baseReduxThunkState,
	list: { ...baseReduxThunkState, data: [] },
	create: baseReduxThunkState,
	update: baseReduxThunkState,
	delete: baseReduxThunkState,
	manageUsers: baseReduxThunkState,
};

export const listHierarchies = createAsyncThunk<
	SearchHierarchyLevelResponse,
	{ scopeRef?: string } | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchHierarchies`,
	async (params, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.listHierarchies(params?.scopeRef);
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
	{ id: string; scopeRef?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchHierarchy`,
	async ({ id, scopeRef }, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.getHierarchy(id, scopeRef);
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
	{ data: CreateHierarchyLevelRequest; scopeRef?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createHierarchy`,
	async ({ data, scopeRef }, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.createHierarchy(data, scopeRef);
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
	{ data: UpdateHierarchyLevelRequest; scopeRef?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateHierarchy`,
	async ({ data, scopeRef }, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.updateHierarchy(data, scopeRef);
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
	{ id: string; scopeRef?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteHierarchy`,
	async ({ id, scopeRef }, { rejectWithValue }) => {
		try {
			await hierarchyService.deleteHierarchy(id, scopeRef);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete hierarchy';
			return rejectWithValue(errorMessage);
		}
	},
);

export const manageHierarchyUsers = createAsyncThunk<
	ManageHierarchyLevelUsersResponse,
	{ data: ManageHierarchyLevelUsersRequest; scopeRef?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/manageHierarchyUsers`,
	async ({ data, scopeRef }, { rejectWithValue }) => {
		try {
			const result = await hierarchyService.manageHierarchyUsers(data, scopeRef);
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
			state.list.data = action.payload;
		},
		resetCreateHierarchy: (state) => {
			state.create = baseReduxThunkState;
		},
		resetUpdateHierarchy: (state) => {
			state.update = baseReduxThunkState;
		},
		resetDeleteHierarchy: (state) => {
			state.delete = baseReduxThunkState;
		},
		resetManageUsers: (state) => {
			state.manageUsers = baseReduxThunkState;
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
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listHierarchies.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listHierarchies.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list hierarchies';
		});
}

function getHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(getHierarchy.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = null;
		})
		.addCase(getHierarchy.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getHierarchy.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = null;
			state.detail.error = action.payload || 'Failed to get hierarchy';
		});
}

function createHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(createHierarchy.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = null;
		})
		.addCase(createHierarchy.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createHierarchy.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create hierarchy';
			state.create.data = null;
		});
}

function updateHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(updateHierarchy.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = null;
		})
		.addCase(updateHierarchy.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateHierarchy.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update hierarchy';
			state.update.data = null;
		});
}

function deleteHierarchyReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(deleteHierarchy.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = null;
		})
		.addCase(deleteHierarchy.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = null;
			state.delete.error = null;
		})
		.addCase(deleteHierarchy.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete hierarchy';
			state.delete.data = null;
		});
}

function manageUsersReducers(builder: ActionReducerMapBuilder<HierarchyState>) {
	builder
		.addCase(manageHierarchyUsers.pending, (state) => {
			state.manageUsers.status = 'pending';
			state.manageUsers.error = null;
			state.manageUsers.data = null;
		})
		.addCase(manageHierarchyUsers.fulfilled, (state, action) => {
			state.manageUsers.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt = action.payload.updatedAt;
			}
			state.manageUsers.error = null;
		})
		.addCase(manageHierarchyUsers.rejected, (state, action) => {
			state.manageUsers.status = 'error';
			state.manageUsers.error = action.payload || 'Failed to manage users in hierarchy';
			state.manageUsers.data = null;
		});
}


export const actions = {
	...hierarchySlice.actions,
};

export const { reducer } = hierarchySlice;