import { createSelector } from 'reselect';

import { reducer, actions, listUsers, getUser, UserState } from '../features/users/userSlice';


const STATE_KEY = 'user';

export const userReducer = {
	[STATE_KEY]: reducer,
};

export const userActions = {
	listUsers,
	getUser,
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
