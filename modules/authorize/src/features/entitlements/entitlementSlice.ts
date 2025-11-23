import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { entitlementService } from './entitlementService';
import { Entitlement } from './types';


export const SLICE_NAME = 'authorize.entitlement';

export type EntitlementState = {
	entitlements: Entitlement[];
	isLoadingList: boolean;
	errorList: string | null;
	entitlementDetail: Entitlement | undefined;
	isLoadingDetail: boolean;
	errorDetail: string | null;
};

const initialState: EntitlementState = {
	entitlements: [],
	isLoadingList: false,
	errorList: null,
	entitlementDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listEntitlements = createAsyncThunk<
	Entitlement[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listEntitlements`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await entitlementService.listEntitlements();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list entitlements';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getEntitlement = createAsyncThunk<
	Entitlement | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getEntitlement`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await entitlementService.getEntitlement(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get entitlement';
			return rejectWithValue(errorMessage);
		}
	},
);

const entitlementSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setEntitlements: (state, action: PayloadAction<Entitlement[]>) => {
			state.entitlements = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listEntitlementsReducers(builder);
		getEntitlementReducers(builder);
	},
});

function listEntitlementsReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(listEntitlements.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listEntitlements.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.entitlements = action.payload;
			state.errorList = null;
		})
		.addCase(listEntitlements.rejected, (state, action) => {
			state.isLoadingList = false;
			state.entitlements = [];
			state.errorList = action.payload || 'Failed to list entitlements';
		});
}

function getEntitlementReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(getEntitlement.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getEntitlement.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.entitlementDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getEntitlement.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.entitlementDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get entitlement';
		});
}


export const actions = {
	...entitlementSlice.actions,
};

export const { reducer } = entitlementSlice;

