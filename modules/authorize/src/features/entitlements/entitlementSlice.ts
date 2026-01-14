import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { entitlementService } from './entitlementService';
import { Entitlement } from './types';
import { ReduxActionState, createInitialReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'authorize.entitlement';

export type EntitlementState = {
	entitlements: Entitlement[];
	entitlementDetail?: Entitlement;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<Entitlement>;
	update: ReduxActionState<Entitlement>;
	delete: ReduxActionState<void>;
};

const initialState: EntitlementState = {
	entitlements: [],
	entitlementDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: createInitialReduxActionState(),
	update: createInitialReduxActionState(),
	delete: createInitialReduxActionState(),
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

export const createEntitlement = createAsyncThunk<
	Entitlement,
	Omit<Entitlement, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createEntitlement`,
	async (entitlement, { rejectWithValue }) => {
		try {
			const result = await entitlementService.createEntitlement(entitlement);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create entitlement';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateEntitlement = createAsyncThunk<
	Entitlement,
	{ id: string; etag: string; name?: string; description?: string | null },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateEntitlement`,
	async ({ id, etag, name, description }, { rejectWithValue }) => {
		try {
			const result = await entitlementService.updateEntitlement(id, etag, { name, description });
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update entitlement';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteEntitlement = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteEntitlement`,
	async (id, { rejectWithValue }) => {
		try {
			await entitlementService.deleteEntitlement(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete entitlement';
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
		resetCreateEntitlement: (state) => {
			state.create = createInitialReduxActionState();
		},
		resetUpdateEntitlement: (state) => {
			state.update = createInitialReduxActionState();
		},
		resetDeleteEntitlement: (state) => {
			state.delete = createInitialReduxActionState();
		},
	},
	extraReducers: (builder) => {
		listEntitlementsReducers(builder);
		getEntitlementReducers(builder);
		createEntitlementReducers(builder);
		updateEntitlementReducers(builder);
		deleteEntitlementReducers(builder);
	},
});

function listEntitlementsReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(listEntitlements.pending, (state) => {
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listEntitlements.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.entitlements = action.payload;
			state.list.error = null;
		})
		.addCase(listEntitlements.rejected, (state, action) => {
			state.list.isLoading = false;
			state.entitlements = [];
			state.list.error = action.payload || 'Failed to list entitlements';
		});
}

function getEntitlementReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(getEntitlement.pending, (state) => {
			state.entitlementDetail = undefined;
		})
		.addCase(getEntitlement.fulfilled, (state, action) => {
			state.entitlementDetail = action.payload;
		})
		.addCase(getEntitlement.rejected, (state) => {
			state.entitlementDetail = undefined;
		});
}

function createEntitlementReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(createEntitlement.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createEntitlement.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.entitlements.push(action.payload);
		})
		.addCase(createEntitlement.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create entitlement';
		});
}

function updateEntitlementReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(updateEntitlement.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateEntitlement.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.entitlementDetail = action.payload;
			const index = state.entitlements.findIndex((e) => e.id === action.payload.id);
			if (index >= 0) {
				state.entitlements[index] = action.payload;
			}
		})
		.addCase(updateEntitlement.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update entitlement';
		});
}

function deleteEntitlementReducers(builder: ActionReducerMapBuilder<EntitlementState>) {
	builder
		.addCase(deleteEntitlement.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteEntitlement.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.entitlements = state.entitlements.filter((e) => e.id !== action.meta.arg);
			if (state.entitlementDetail?.id === action.meta.arg) {
				state.entitlementDetail = undefined;
			}
		})
		.addCase(deleteEntitlement.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete entitlement';
		});
}


export const actions = {
	...entitlementSlice.actions,
};

export const { reducer } = entitlementSlice;
