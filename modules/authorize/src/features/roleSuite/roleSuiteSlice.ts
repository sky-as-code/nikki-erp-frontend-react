import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { roleSuiteService } from './roleSuiteService';
import { RoleSuite } from './types';


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


export const actions = {
	...roleSuiteSlice.actions,
};

export const { reducer } = roleSuiteSlice;

