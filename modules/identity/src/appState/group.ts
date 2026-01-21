import { createSelector } from '@reduxjs/toolkit';

import { reducer, actions, listGroups, getGroup, createGroup, updateGroup, deleteGroup, manageGroupUsers, GroupState } from '../features/group/groupSlice';


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
	(state) => state.list,
);

export const selectGroupDetail = createSelector(
	selectGroupState,
	(state) => state.detail,
);

export const selectCreateGroup = createSelector(
	selectGroupState,
	(state) => state.create,
);

export const selectUpdateGroup = createSelector(
	selectGroupState,
	(state) => state.update,
);

export const selectDeleteGroup = createSelector(
	selectGroupState,
	(state) => state.delete,
);

export const selectManageGroupUsers = createSelector(
	selectGroupState,
	(state) => state.manageUsers,
);
