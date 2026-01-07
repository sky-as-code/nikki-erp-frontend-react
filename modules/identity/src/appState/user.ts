import { createSelector } from '@reduxjs/toolkit';

import { reducer, actions, listUsers, getUser, createUser, updateUser, deleteUser, UserState, listUsersByGroupId } from '../features/user/userSlice';


const STATE_KEY = 'user';

export const userReducer = {
	[STATE_KEY]: reducer,
};

export const userActions = {
	listUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	listUsersByGroupId,
	...actions,
};

export const selectUserState = (state: { [STATE_KEY]: UserState }) => state[STATE_KEY];

export const selectUserList = createSelector(
	selectUserState,
	(state) => state.users,
);

export const selectUserDetail = createSelector(
	selectUserState,
	(state) => state.userDetail,
);
