import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { actionService } from './actionService';
import { Action } from './types';
import { ReduxActionState, baseReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'authorize.action';

export type ActionState = {
	actions: Action[];
	actionDetail?: Action;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<Action>;
	update: ReduxActionState<Action>;
	delete: ReduxActionState<void>;
};

const initialState: ActionState = {
	actions: [],
	actionDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
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
		resetCreateAction: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateAction: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteAction: (state) => {
			state.delete = baseReduxActionState;
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
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listActions.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.actions = action.payload;
			state.list.error = null;
		})
		.addCase(listActions.rejected, (state, action) => {
			state.list.isLoading = false;
			state.actions = [];
			state.list.error = action.payload || 'Failed to list actions';
		});
}

function getActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(getAction.pending, (state) => {
			state.actionDetail = undefined;
		})
		.addCase(getAction.fulfilled, (state, action) => {
			state.actionDetail = action.payload;
		})
		.addCase(getAction.rejected, (state) => {
			state.actionDetail = undefined;
		});
}

function createActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(createAction.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createAction.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.actions.push(action.payload);
		})
		.addCase(createAction.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create action';
		});
}

function updateActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(updateAction.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateAction.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.actionDetail = action.payload;
			const index = state.actions.findIndex((a) => a.id === action.payload.id);
			if (index >= 0) {
				state.actions[index] = action.payload;
			}
		})
		.addCase(updateAction.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update action';
		});
}

function deleteActionReducers(builder: ActionReducerMapBuilder<ActionState>) {
	builder
		.addCase(deleteAction.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteAction.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.actions = state.actions.filter((a) => a.id !== action.meta.arg.actionId);
			if (state.actionDetail?.id === action.meta.arg.actionId) {
				state.actionDetail = undefined;
			}
		})
		.addCase(deleteAction.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete action';
		});
}


export const actions = {
	...actionSlice.actions,
};

export const { reducer } = actionSlice;
