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
} from '../features/roles/roleSlice';


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
	...actions,
};

export const selectRoleState = (state: { [STATE_KEY]: RoleState }) => state[STATE_KEY];

export const selectRoleList = createSelector(
	selectRoleState,
	(state) => state.roles,
);

export const selectRoleDetail = createSelector(
	selectRoleState,
	(state) => state.roleDetail,
);

