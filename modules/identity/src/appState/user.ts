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
	(state) => state.create,
);

export const selectDeleteUser = createSelector(
	selectUserState,
	(state) => state.delete,
);

export const selectGetUser = createSelector(
	selectUserState,
	(state) => state.getOne,
);

export const selectSearchUsers = createSelector(
	selectUserState,
	(state) => state.search,
);

export const selectSetUserIsArchived = createSelector(
	selectUserState,
	(state) => state.setIsArchived,
);

export const selectUserExists = createSelector(
	selectUserState,
	(state) => state.exists,
);

export const selectUpdateUser = createSelector(
	selectUserState,
	(state) => state.update,
);
