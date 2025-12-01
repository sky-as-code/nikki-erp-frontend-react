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
	{ actionId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getAction`,
	async ({ actionId }, { rejectWithValue }) => {
		try {
			const result = await actionService.getAction(actionId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get action';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createAction = createAsyncThunk<
	Action,
	Omit<Action, 'id' | 'createdAt' | 'etag' | 'resources' | 'entitlementsCount'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createAction`,
	async (action, { rejectWithValue }) => {
		try {
			const result = await actionService.createAction(action);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create action';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateAction = createAsyncThunk<
	Action,
	{ actionId: string; etag: string; description?: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateAction`,
	async ({ actionId, etag, description }, { rejectWithValue }) => {
		try {
			const result = await actionService.updateAction(actionId, { etag, description });
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update action';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteAction = createAsyncThunk<
	void,
	{ actionId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteAction`,
	async ({ actionId }, { rejectWithValue }) => {
		try {
			await actionService.deleteAction(actionId);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete action';
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
		createActionReducers(builder);
		updateActionReducers(builder);
		deleteActionReducers(builder);
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

function createActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(createAction.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(createAction.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.actionDetail = action.payload;
			state.actions.push(action.payload);
			state.errorDetail = null;
		})
		.addCase(createAction.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to create action';
		});
}

function updateActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(updateAction.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(updateAction.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.actionDetail = action.payload;
			const index = state.actions.findIndex((a) => a.id === action.payload.id);
			if (index >= 0) {
				state.actions[index] = action.payload;
			}
			state.errorDetail = null;
		})
		.addCase(updateAction.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to update action';
		});
}

function deleteActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(deleteAction.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(deleteAction.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.actions = state.actions.filter((a) => a.id !== action.meta.arg.actionId);
			if (state.actionDetail?.id === action.meta.arg.actionId) {
				state.actionDetail = undefined;
			}
			state.errorDetail = null;
		})
		.addCase(deleteAction.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to delete action';
		});
}


export const actions = {
	...actionSlice.actions,
};

export const { reducer } = actionSlice;
