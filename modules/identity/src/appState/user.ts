import { createSelector } from '@reduxjs/toolkit';

import { reducer, actions, UserState } from '../features/user/userSlice';
import { initialState as initialUserState } from '../features/user/userSlice';


const STATE_KEY = 'user';

export const userReducer = {
	[STATE_KEY]: reducer,
};

export const userActions = actions;

export const selectUserState =
	(state: { [STATE_KEY]?: UserState }) => state?.[STATE_KEY] ?? initialUserState;

export const selectCreateUser = createSelector(
	selectUserState,
	(state) => state.createUser,
);

export const selectDeleteUser = createSelector(
	selectUserState,
	(state) => state.deleteUser,
);

export const selectGetUser = createSelector(
	selectUserState,
	(state) => state.getUser,
);

export const selectSearchUsers = createSelector(
	selectUserState,
	(state) => state.searchUsers,
);

export const selectSetUserIsArchived = createSelector(
	selectUserState,
	(state) => state.setUserIsArchived,
);

export const selectUserExists = createSelector(
	selectUserState,
	(state) => state.userExists,
);

export const selectUpdateUser = createSelector(
	selectUserState,
	(state) => state.updateUser,
);
