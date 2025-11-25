import { createSelector } from '@reduxjs/toolkit';

import { reducer, actions, listGroups, getGroup, createGroup, updateGroup, deleteGroup, manageGroupUsers, GroupState } from '../features/groups/groupSlice';


const STATE_KEY = 'group';

export const groupReducer = {
	[STATE_KEY]: reducer,
};

export const groupActions = {
	listGroups,
	getGroup,
	createGroup,
	updateGroup,
	deleteGroup,
	manageGroupUsers,
	...actions,
};

export const selectGroupState = (state: { [STATE_KEY]: GroupState }) => state[STATE_KEY];

export const selectGroupList = createSelector(
	selectGroupState,
	(state) => state.groups,
);

export const selectGroupDetail = createSelector(
	selectGroupState,
	(state) => state.groupDetail,
);
