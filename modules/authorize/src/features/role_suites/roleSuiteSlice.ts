import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { roleSuiteService } from './roleSuiteService';

import type { RoleSuite } from './types';


export const SLICE_NAME = 'authorize.roleSuite';

export type RoleSuiteState = {
	roleSuites: RoleSuite[];
	isLoadingList: boolean;
	errorList: string | null;
	roleSuiteDetail: RoleSuite | undefined;
	isLoadingDetail: boolean;
	errorDetail: string | null;
};

const initialState: RoleSuiteState = {
	roleSuites: [],
	isLoadingList: false,
	errorList: null,
	roleSuiteDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listRoleSuites = createAsyncThunk<
	RoleSuite[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listRoleSuites`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await roleSuiteService.listRoleSuites();
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
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
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
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listRoleSuites.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.roleSuites = action.payload;
			state.errorList = null;
		})
		.addCase(listRoleSuites.rejected, (state, action) => {
			state.isLoadingList = false;
			state.roleSuites = [];
			state.errorList = action.payload || 'Failed to list role suites';
		});
}

function getRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(getRoleSuite.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getRoleSuite.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleSuiteDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getRoleSuite.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.roleSuiteDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get role suite';
		});
}

function createRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(createRoleSuite.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(createRoleSuite.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleSuiteDetail = action.payload;
			state.roleSuites.push(action.payload);
			state.errorDetail = null;
		})
		.addCase(createRoleSuite.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to create role suite';
		});
}

function updateRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(updateRoleSuite.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(updateRoleSuite.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleSuiteDetail = action.payload;
			const index = state.roleSuites.findIndex((r) => r.id === action.payload.id);
			if (index >= 0) {
				state.roleSuites[index] = action.payload;
			}
			state.errorDetail = null;
		})
		.addCase(updateRoleSuite.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to update role suite';
		});
}

function deleteRoleSuiteReducers(builder: ActionReducerMapBuilder<RoleSuiteState>) {
	builder
		.addCase(deleteRoleSuite.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(deleteRoleSuite.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleSuites = state.roleSuites.filter((r) => r.id !== action.meta.arg.id);
			if (state.roleSuiteDetail?.id === action.meta.arg.id) {
				state.roleSuiteDetail = undefined;
			}
			state.errorDetail = null;
		})
		.addCase(deleteRoleSuite.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to delete role suite';
		});
}


export const actions = {
	...roleSuiteSlice.actions,
};

export const { reducer } = roleSuiteSlice;

