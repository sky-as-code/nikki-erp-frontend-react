import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listRoleSuites,
	getRoleSuite,
	RoleSuiteState,
	createRoleSuite,
	updateRoleSuite,
	deleteRoleSuite,
} from '@/features/roleSuite/roleSuiteSlice';


const STATE_KEY = 'roleSuite';

export const roleSuiteReducer = {
	[STATE_KEY]: reducer,
};

export const roleSuiteActions = {
	listRoleSuites,
	getRoleSuite,
	createRoleSuite,
	updateRoleSuite,
	deleteRoleSuite,
	...actions,
};

export const selectRoleSuiteState = (state: { [STATE_KEY]: RoleSuiteState }) => state[STATE_KEY];

export const selectRoleSuiteList = createSelector(
	selectRoleSuiteState,
	(state) => state.roleSuites,
);

export const selectRoleSuiteDetail = createSelector(
	selectRoleSuiteState,
	(state) => state.roleSuiteDetail,
);

