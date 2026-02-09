import {
	createAsyncThunk,
	createSlice,
	type ActionReducerMapBuilder,
	type PayloadAction,
} from '@reduxjs/toolkit';

import type { ListResponse } from '@/services/authzService';

import { Resource } from '@/features/resources';
import {
	listEntitlements as listEntitlementsApi,
	listResources as listResourcesApi,
} from '@/services/authzService';



export const SLICE_NAME = 'authorize';

export type AuthzResource = Resource;

export type AuthzActionRow = {
	id: string;
	name: string;
	resourceId: string;
	resourceName: string;
};

export type AuthzEntitlement = {
	id: string;
	name: string;
	description?: string;
	actionId: string;
	actionName?: string;
	resourceId: string;
	resourceName?: string;
	subjectType?: string;
	subjectRef?: string;
	subjectDisplayName?: string | null;
	orgId?: string | null;
	scopeRef?: string | null;
};

export type AuthorizeState = {
	resources: AuthzResource[];
	isLoadingResources: boolean;
	resourcesError: string | null;

	actions: AuthzActionRow[];
	isLoadingActions: boolean;
	actionsError: string | null;

	entitlements: AuthzEntitlement[];
	isLoadingEntitlements: boolean;
	entitlementsError: string | null;
};

const initialState: AuthorizeState = {
	resources: [],
	isLoadingResources: false,
	resourcesError: null,
	actions: [],
	isLoadingActions: false,
	actionsError: null,
	entitlements: [],
	isLoadingEntitlements: false,
	entitlementsError: null,
};

export const listResources = createAsyncThunk<
	AuthzResource[],
	void,
	{ rejectValue: string }
>(`${SLICE_NAME}/resources`, async (_, { rejectWithValue }) => {
	try {
		const result = await listResourcesApi();
		return (result as ListResponse<Resource>).items;
	}
	catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to list resources';
		return rejectWithValue(errorMessage);
	}
});

export const listEntitlements = createAsyncThunk<
	AuthzEntitlement[],
	void,
	{ rejectValue: string }
>(`${SLICE_NAME}/listEntitlements`, async (_, { rejectWithValue }) => {
	try {
		const result = await listEntitlementsApi();
		return (result as ListResponse<AuthzEntitlement>).items;
	}
	catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to list entitlements';
		return rejectWithValue(errorMessage);
	}
});

const authorizeSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setResources: (state, action: PayloadAction<AuthzResource[]>) => {
			state.resources = action.payload;
		},
		setEntitlements: (state, action: PayloadAction<AuthzEntitlement[]>) => {
			state.entitlements = action.payload;
		},
	},
	extraReducers: (builder) => {
		listResourcesReducers(builder);
		listEntitlementsReducers(builder);
	},
});


function listResourcesReducers(builder: ActionReducerMapBuilder<AuthorizeState>): void {
	builder
		.addCase(listResources.pending, (state) => {
			state.isLoadingResources = true;
			state.resourcesError = null;
			state.isLoadingActions = true;
			state.actionsError = null;
		})
		.addCase(listResources.fulfilled, (state, action) => {
			state.isLoadingResources = false;
			state.resources = action.payload;
			state.resourcesError = null;
			const rows: AuthzActionRow[] = [];
			for (const res of action.payload) {
				if (Array.isArray(res.actions)) {
					for (const action of res.actions) {
						rows.push({
							id: `${res.id}:${action.id}`,
							name: action.name,
							resourceId: res.id,
							resourceName: res.name,
						});
					}
				}
			}
			state.actions = rows;
			state.isLoadingActions = false;
			state.actionsError = null;
		})
		.addCase(listResources.rejected, (state, action) => {
			state.isLoadingResources = false;
			state.resources = [];
			state.resourcesError = action.payload || 'Failed to list resources';
			state.isLoadingActions = false;
			state.actions = [];
			state.actionsError = action.payload || 'Failed to list actions';
		});
}

function listEntitlementsReducers(builder: ActionReducerMapBuilder<AuthorizeState>): void {
	builder
		.addCase(listEntitlements.pending, (state) => {
			state.isLoadingEntitlements = true;
			state.entitlementsError = null;
		})
		.addCase(listEntitlements.fulfilled, (state, action) => {
			state.isLoadingEntitlements = false;
			state.entitlements = action.payload;
			state.entitlementsError = null;
		})
		.addCase(listEntitlements.rejected, (state, action) => {
			state.isLoadingEntitlements = false;
			state.entitlements = [];
			state.entitlementsError = action.payload || 'Failed to list entitlements';
		});
}

export const selectAuthorizeState = (state: AuthorizeState) => state;

export const actions = {
	...authorizeSlice.actions,
	listResources,
	listEntitlements,
};

export const { reducer } = authorizeSlice;
