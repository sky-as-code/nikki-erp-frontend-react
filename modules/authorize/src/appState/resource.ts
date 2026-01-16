import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listResources,
	getResource,
	createResource,
	updateResource,
	deleteResource,
	ResourceState,
} from '@/features/resources/resourceSlice';


const STATE_KEY = 'resource';

export const resourceReducer = {
	[STATE_KEY]: reducer,
};

export const resourceActions = {
	listResources,
	getResource,
	createResource,
	updateResource,
	deleteResource,
	...actions,
};

export const selectResourceState = (state: { [STATE_KEY]: ResourceState }) => state[STATE_KEY];

export const selectResourceList = createSelector(
	selectResourceState,
	(state) => state.list2,
);

export const selectResourceDetail = createSelector(
	selectResourceState,
	(state) => state.detail,
);

export const selectCreateResource = createSelector(
	selectResourceState,
	(state) => state.create,
);

export const selectUpdateResource = createSelector(
	selectResourceState,
	(state) => state.update,
);

export const selectDeleteResource = createSelector(
	selectResourceState,
	(state) => state.delete,
);
