import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { actionService } from './actionService';
import { Action } from './types';


export const SLICE_NAME = 'authorize.action';

export type ActionState = {
	actions: Action[];
	isLoadingList: boolean;
	errorList: string | null;
	actionDetail: Action | undefined;
	isLoadingDetail: boolean;
	errorDetail: string | null;
};

const initialState: ActionState = {
	actions: [],
	isLoadingList: false,
	errorList: null,
	actionDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listActions = createAsyncThunk<
	Action[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listActions`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await actionService.listActions();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list actions';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getAction = createAsyncThunk<
	Action | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getAction`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await actionService.getAction(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get action';
			return rejectWithValue(errorMessage);
		}
	},
);

const actionSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setActions: (state, action: PayloadAction<Action[]>) => {
			state.actions = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listActionsReducers(builder);
		getActionReducers(builder);
	},
});

function listActionsReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(listActions.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listActions.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.actions = action.payload;
			state.errorList = null;
		})
		.addCase(listActions.rejected, (state, action) => {
			state.isLoadingList = false;
			state.actions = [];
			state.errorList = action.payload || 'Failed to list actions';
		});
}

function getActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(getAction.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getAction.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.actionDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getAction.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.actionDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get action';
		});
}


export const actions = {
	...actionSlice.actions,
};

export const { reducer } = actionSlice;

