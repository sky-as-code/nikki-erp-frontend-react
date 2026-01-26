import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listRoles,
	getRole,
	RoleState,
	createRole,
	updateRole,
	deleteRole,
	addEntitlementsToRole,
	removeEntitlementsFromRole,
	initialState
} from '@/features/roles/roleSlice';


const STATE_KEY = 'role';

export const roleReducer = {
	[STATE_KEY]: reducer,
};

export const roleActions = {
	listRoles,
	getRole,
	createRole,
	updateRole,
	deleteRole,
	addEntitlementsToRole,
	removeEntitlementsFromRole,
	...actions,
};

export const selectRoleState = (state: { [STATE_KEY]: RoleState }) => state[STATE_KEY] ?? initialState;

export const selectRoleList = createSelector(
	selectRoleState,
	(state) => state.roles,
);

export const selectRoleDetail = createSelector(
	selectRoleState,
	(state) => state.roleDetail,
);

export const selectCreateRole = createSelector(
	selectRoleState,
	(state) => state.create,
);

export const selectUpdateRole = createSelector(
	selectRoleState,
	(state) => state.update,
);

export const selectDeleteRole = createSelector(
	selectRoleState,
	(state) => state.delete,
);

export const selectAddEntitlementsRole = createSelector(
	selectRoleState,
	(state) => state.addEntitlements,
);

export const selectRemoveEntitlementsRole = createSelector(
	selectRoleState,
	(state) => state.removeEntitlements,
);
