import { createSelector } from '@reduxjs/toolkit';

import { reducer, actions, listUsers, getUser, createUser, updateUser, deleteUser, UserState } from '../features/user/userSlice';


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

export const selectCreateUser = createSelector(
	selectUserState,
	(state) => state.create,
);

export const selectUpdateUser = createSelector(
	selectUserState,
	(state) => state.update,
);

export const selectDeleteUser = createSelector(
	selectUserState,
	(state) => state.delete,
);
