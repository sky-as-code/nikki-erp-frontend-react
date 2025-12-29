import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { roleService } from './roleService';
import { Role } from './types';
import { entitlementService } from '../entitlements/entitlementService';
import { Entitlement } from '../entitlements/types';


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

async function hydrateEntitlements(
	entitlements?: Entitlement[],
): Promise<Entitlement[] | undefined> {
	if (!entitlements?.length) return entitlements;

	const ids = entitlements.map((e: Entitlement) => e.id);
	const fullEntitlements = await entitlementService.getEntitlementsByIds(ids);

	if (!fullEntitlements.length) return entitlements;

	const map = new Map(fullEntitlements.map((e: Entitlement) => [e.id, e]));

	const result = entitlements
		.reduce((acc: Entitlement[], e: Entitlement): Entitlement[] => {
			const full = map.get(e.id);
			if (!full) return acc;
			return [...acc, { ...full, scopeRef: e.scopeRef }];
		}, []);

	return result;
}

export const listRoles = createAsyncThunk<
	Role[],
	{ graph?: Record<string, unknown>; page?: number; size?: number } | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/list`,
	async (params, { rejectWithValue }) => {
		try {
			const result = await roleService.listRoles(params || undefined);
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
	`${SLICE_NAME}/get`,
	async (roleId, { rejectWithValue }) => {
		try {
			const role = await roleService.getRole(roleId);
			if (!role) return undefined;

			const hydrated = await hydrateEntitlements(role.entitlements);

			return { ...role, entitlements: hydrated as Entitlement[] };
		}
		catch (error) {
			return rejectWithValue(
				error instanceof Error ? error.message : 'Failed to get role',
			);
		}
	},
);

export const createRole = createAsyncThunk<
	Role,
	Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'entitlementsCount' | 'assignmentsCount' | 'suitesCount' | 'ownerName'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/create`,
	async (role, { rejectWithValue }) => {
		try {
			const result = await roleService.createRole(role);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create role';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateRole = createAsyncThunk<
	Role,
	{ id: string; etag: string; name?: string; description?: string | null },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/update`,
	async ({ id, etag, name, description }, { rejectWithValue }) => {
		try {
			const result = await roleService.updateRole(id, etag, { name, description });
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteRole = createAsyncThunk<
	void,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/delete`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await roleService.deleteRole(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete role';
			return rejectWithValue(errorMessage);
		}
	},
);

export const addEntitlementsToRole = createAsyncThunk<
	void,
	{ roleId: string; etag: string; entitlementInputs: Array<{ entitlementId: string; scopeRef?: string }> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/addEntitlements`,
	async ({ roleId, etag, entitlementInputs }, { rejectWithValue }) => {
		try {
			await roleService.addEntitlementsToRole(roleId, etag, entitlementInputs);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to add entitlements to role';
			return rejectWithValue(errorMessage);
		}
	},
);

export const removeEntitlementsFromRole = createAsyncThunk<
	void,
	{ roleId: string; etag: string; entitlementInputs: Array<{ entitlementId: string; scopeRef?: string }> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/removeEntitlements`,
	async ({ roleId, etag, entitlementInputs }, { rejectWithValue }) => {
		try {
			await roleService.removeEntitlementsFromRole(roleId, etag, entitlementInputs);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to remove entitlements from role';
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
		createRoleReducers(builder);
		updateRoleReducers(builder);
		deleteRoleReducers(builder);
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

function createRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(createRole.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(createRole.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleDetail = action.payload;
			state.roles.push(action.payload);
			state.errorDetail = null;
		})
		.addCase(createRole.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to create role';
		});
}

function updateRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(updateRole.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(updateRole.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roleDetail = action.payload;
			const index = state.roles.findIndex((r) => r.id === action.payload.id);
			if (index >= 0) {
				state.roles[index] = action.payload;
			}
			state.errorDetail = null;
		})
		.addCase(updateRole.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to update role';
		});
}

function deleteRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(deleteRole.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(deleteRole.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.roles = state.roles.filter((r) => r.id !== action.meta.arg.id);
			if (state.roleDetail?.id === action.meta.arg.id) {
				state.roleDetail = undefined;
			}
			state.errorDetail = null;
		})
		.addCase(deleteRole.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.errorDetail = action.payload || 'Failed to delete role';
		});
}


export const actions = {
	...roleSlice.actions,
};

export const { reducer } = roleSlice;

