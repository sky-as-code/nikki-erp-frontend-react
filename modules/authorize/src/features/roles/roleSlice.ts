import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { roleService } from './roleService';
import { Role } from './types';
import { ReduxActionState, baseReduxActionState } from '../../appState/reduxActionState';
import { entitlementService } from '../entitlements/entitlementService';
import { Entitlement } from '../entitlements/types';


export const SLICE_NAME = 'authorize.role';

export type RoleState = {
	roles: Role[];
	roleDetail: Role | undefined;

	list: {
		isLoading: boolean;
		error: string | null;
	};

	create: ReduxActionState<Role>;
	update: ReduxActionState<Role>;
	delete: ReduxActionState<void>;
	addEntitlements: ReduxActionState<void>;
	removeEntitlements: ReduxActionState<void>;
};

const initialState: RoleState = {
	roles: [],
	roleDetail: undefined,

	list: {
		isLoading: false,
		error: null,
	},

	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	addEntitlements: baseReduxActionState,
	removeEntitlements: baseReduxActionState,
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
			state.list.isLoading = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.list.error = action.payload;
		},
		resetCreateRole: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateRole: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteRole: (state) => {
			state.delete = baseReduxActionState;
		},
		resetAddEntitlementsRole: (state) => {
			state.addEntitlements = baseReduxActionState;
		},
		resetRemoveEntitlementsRole: (state) => {
			state.removeEntitlements = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listRolesReducers(builder);
		getRoleReducers(builder);
		createRoleReducers(builder);
		updateRoleReducers(builder);
		deleteRoleReducers(builder);
		addEntitlementsReducers(builder);
		removeEntitlementsReducers(builder);
	},
});

function listRolesReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(listRoles.pending, (state) => {
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(listRoles.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.roles = action.payload;
			state.list.error = null;
		})
		.addCase(listRoles.rejected, (state, action) => {
			state.list.isLoading = false;
			state.roles = [];
			state.list.error = action.payload || 'Failed to list roles';
		});
}

function getRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(getRole.pending, (state) => {
			state.list.isLoading = true;
			state.list.error = null;
		})
		.addCase(getRole.fulfilled, (state, action) => {
			state.list.isLoading = false;
			state.roleDetail = action.payload;
			state.list.error = null;
		})
		.addCase(getRole.rejected, (state, action) => {
			state.list.isLoading = false;
			state.roleDetail = undefined;
			state.list.error = action.payload || 'Failed to get role';
		});
}

function createRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(createRole.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createRole.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.roleDetail = action.payload;
			state.roles.push(action.payload);
		})
		.addCase(createRole.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create role';
		});
}

function updateRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(updateRole.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateRole.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.roleDetail = action.payload;
			const index = state.roles.findIndex((r) => r.id === action.payload.id);
			if (index >= 0) {
				state.roles[index] = action.payload;
			}
		})
		.addCase(updateRole.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update role';
		});
}

function deleteRoleReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(deleteRole.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteRole.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.roles = state.roles.filter((r) => r.id !== action.meta.arg.id);
			if (state.roleDetail?.id === action.meta.arg.id) {
				state.roleDetail = undefined;
			}
		})
		.addCase(deleteRole.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete role';
		});
}

function addEntitlementsReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(addEntitlementsToRole.pending, (state, _action) => {
			state.addEntitlements.status = 'pending';
			state.addEntitlements.error = null;
		})
		.addCase(addEntitlementsToRole.fulfilled, (state) => {
			state.addEntitlements.status = 'success';
		})
		.addCase(addEntitlementsToRole.rejected, (state, action) => {
			state.addEntitlements.status = 'error';
			state.addEntitlements.error = action.payload || 'Failed to add entitlements';
		});
}

function removeEntitlementsReducers(builder: ActionReducerMapBuilder<RoleState>) {
	builder
		.addCase(removeEntitlementsFromRole.pending, (state, _action) => {
			state.removeEntitlements.status = 'pending';
			state.removeEntitlements.error = null;
		})
		.addCase(removeEntitlementsFromRole.fulfilled, (state) => {
			state.removeEntitlements.status = 'success';
		})
		.addCase(removeEntitlementsFromRole.rejected, (state, action) => {
			state.removeEntitlements.status = 'error';
			state.removeEntitlements.error = action.payload || 'Failed to remove entitlements';
		});
}


export const actions = {
	...roleSlice.actions,
};

export const { reducer } = roleSlice;

