import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listHierarchies,
	getHierarchy,
	createHierarchy,
	updateHierarchy,
	deleteHierarchy,
	manageHierarchyUsers,
	HierarchyState,
	initialState,
} from '../features/hierarchy/hierarchySlice';
import { initialState as initialHierarchyState } from '../features/hierarchy/hierarchySlice';


const STATE_KEY = 'hierarchy';

export const hierarchyReducer = {
	[STATE_KEY]: reducer,
};

export const hierarchyActions = {
	listHierarchies,
	getHierarchy,
	createHierarchy,
	updateHierarchy,
	deleteHierarchy,
	manageHierarchyUsers,
	...actions,
};

export const selectHierarchyState =
	(state: { [STATE_KEY]?: HierarchyState }) => state?.[STATE_KEY] ?? initialHierarchyState;

export const selectHierarchyList = createSelector(
	selectHierarchyState,
	(state) => state.list,
);

export const selectHierarchyDetail = createSelector(
	selectHierarchyState,
	(state) => state.detail,
);

export const selectCreateHierarchy = createSelector(
	selectHierarchyState,
	(state) => state.create,
);

export const selectUpdateHierarchy = createSelector(
	selectHierarchyState,
	(state) => state.update,
);

export const selectDeleteHierarchy = createSelector(
	selectHierarchyState,
	(state) => state.delete,
);

export const selectManageHierarchyUsers = createSelector(
	selectHierarchyState,
	(state) => state.manageUsers,
);