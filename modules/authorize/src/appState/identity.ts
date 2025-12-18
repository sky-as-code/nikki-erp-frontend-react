import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listUsers,
	listGroups,
	type IdentityState,
} from '@/features/identities/identitySlice';


const STATE_KEY = 'identity';

export const identityReducer = {
	[STATE_KEY]: reducer,
};

export const identityActions = {
	listUsers,
	listGroups,
	...actions,
};

export const selectIdentityState = (state: { [STATE_KEY]: IdentityState }) => state[STATE_KEY];

export const selectUserList = createSelector(
	selectIdentityState,
	(state) => state.users,
);

export const selectGroupList = createSelector(
	selectIdentityState,
	(state) => state.groups,
);
