import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { roleService } from './roleService';
import { Role } from './types';


export const SLICE_NAME = 'authorize.role';

export type RoleState = {
	roles: Role[];
	isLoadingList: boolean;
	errorList: string | null;
	roleDetail: Role | undefined;
	isLoadingDetail: boolean;
	errorDetail: string | null;
};

const initialState: RoleState = {
	roles: [],
	isLoadingList: false,
	errorList: null,
	roleDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listRoles = createAsyncThunk<
	Role[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listRoles`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await roleService.listRoles();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list roles';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getRole = createAsyncThunk<
	Role | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getRole`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await roleService.getRole(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get role';
			return rejectWithValue(errorMessage);
		}
	},
);

const roleSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setRoles: (state, action: PayloadAction<Role[]>) => {
			state.roles = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listRolesReducers(builder);
		getRoleReducers(builder);
	},
});

function listRolesReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(listRoles.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listRoles.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.roles = action.payload;
			state.errorList = null;
		})
		.addCase(listRoles.rejected, (state, action) => {
			state.isLoadingList = false;
			state.roles = [];
			state.errorList = action.payload || 'Failed to list roles';
		});
}

function getRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(getRole.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getRole.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getRole.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.roleDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get role';
		});
}


export const actions = {
	...roleSlice.actions,
};

export const { reducer } = roleSlice;

