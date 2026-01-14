import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { roleSuiteService } from './roleSuiteService';
import { ReduxActionState, createInitialReduxActionState } from '../../appState/reduxActionState';

import type { RoleSuite } from './types';


export const SLICE_NAME = 'authorize.roleSuite';

export type RoleSuiteState = {
	roleSuites: RoleSuite[];
	roleSuiteDetail: RoleSuite | undefined;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<RoleSuite>;
	update: ReduxActionState<RoleSuite>;
	delete: ReduxActionState<void>;
};

const initialState: RoleSuiteState = {
	roleSuites: [],
	roleSuiteDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: createInitialReduxActionState(),
	update: createInitialReduxActionState(),
	delete: createInitialReduxActionState(),
};

export const listRoleSuites = createAsyncThunk<
	RoleSuite[],
	{ graph?: Record<string, unknown>; page?: number; size?: number } | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listRoleSuites`,
	async (params, { rejectWithValue }) => {
		try {
			const result = await roleSuiteService.listRoleSuites(params || undefined);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list role suites';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getRoleSuite = createAsyncThunk<
	RoleSuite | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getRoleSuite`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await roleSuiteService.getRoleSuite(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get role suite';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createRoleSuite = createAsyncThunk<
	RoleSuite,
	Omit<RoleSuite, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'rolesCount' | 'ownerName'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (roleSuite, { rejectWithValue }) => {
		try {
			const result = await roleSuiteService.createRoleSuite(roleSuite);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create role suite';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateRoleSuite = createAsyncThunk<
	RoleSuite,
	{ id: string; etag: string; name?: string; description?: string | null; roleIds?: string[] },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/update`,
	async ({ id, etag, name, description, roleIds }, { rejectWithValue }) => {
		try {
			const result = await roleSuiteService.updateRoleSuite(id, etag, { name, description, roleIds });
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update role suite';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteRoleSuite = createAsyncThunk<
	void,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteRoleSuite`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await roleSuiteService.deleteRoleSuite(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete role suite';
			return rejectWithValue(errorMessage);
		}
	},
);

const roleSuiteSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setRoleSuites: (state, action: PayloadAction<RoleSuite[]>) => {
			state.roleSuites = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.list.isLoading = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.list.error = action.payload;
		},
		resetCreateRoleSuite: (state) => {
			state.create = createInitialReduxActionState();
		},
		resetUpdateRoleSuite: (state) => {
			state.update = createInitialReduxActionState();
		},
		resetDeleteRoleSuite: (state) => {
			state.delete = createInitialReduxActionState();
		},
	},
	extraReducers: (builder) => {
		listRoleSuitesReducers(builder);
		getRoleSuiteReducers(builder);
		createRoleSuiteReducers(builder);
		updateRoleSuiteReducers(builder);
		deleteRoleSuiteReducers(builder);
	},
});

function listRoleSuitesReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(listRoleSuites.pending, (state) => {
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listRoleSuites.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.roleSuites = action.payload;
			state.list.error = null;
		})
		.addCase(listRoleSuites.rejected, (state, action) => {
			state.list.isLoading = false;
			state.roleSuites = [];
			state.list.error = action.payload || 'Failed to list role suites';
		});
}

function getRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(getRoleSuite.pending, (state) => {
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(getRoleSuite.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.roleSuiteDetail = action.payload;
			state.list.error = null;
		})
		.addCase(getRoleSuite.rejected, (state, action) => {
			state.list.isLoading = false;
			state.roleSuiteDetail = undefined;
			state.list.error = action.payload || 'Failed to get role suite';
		});
}

function createRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(createRoleSuite.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createRoleSuite.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.roleSuiteDetail = action.payload;
			state.roleSuites.push(action.payload);
		})
		.addCase(createRoleSuite.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create role suite';
		});
}

function updateRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(updateRoleSuite.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateRoleSuite.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.roleSuiteDetail = action.payload;
			const index = state.roleSuites.findIndex((r) => r.id === action.payload.id);
			if (index >= 0) {
				state.roleSuites[index] = action.payload;
			}
		})
		.addCase(updateRoleSuite.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update role suite';
		});
}

function deleteRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(deleteRoleSuite.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteRoleSuite.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.roleSuites = state.roleSuites.filter((r) => r.id !== action.meta.arg.id);
			if (state.roleSuiteDetail?.id === action.meta.arg.id) {
				state.roleSuiteDetail = undefined;
			}
		})
		.addCase(deleteRoleSuite.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete role suite';
		});
}


export const actions = {
	...roleSuiteSlice.actions,
};

export const { reducer } = roleSuiteSlice;

