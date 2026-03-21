import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	initialState,
	listUsers,
	reducer,
	type IdentityState,
} from '@/features/identities/identitySlice';

const STATE_KEY = 'identity';

export const identityReducer = {
	[STATE_KEY]: reducer,
};

export const identityActions = {
	listUsers,
	...actions,
};

export const selectIdentityState = (state: {
	[STATE_KEY]: IdentityState;
}) =>
	state[STATE_KEY] ?? initialState;

export const selectIdentityUsers = createSelector(
	selectIdentityState,
	(state) => state.users,
);

export const selectIdentityListUsersState = createSelector(
	selectIdentityState,
	(state) => ({
		status: state.isLoadingUsers ? 'pending' : 'idle',
		error: state.errorUsers,
	}),
);

