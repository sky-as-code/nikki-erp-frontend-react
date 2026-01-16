import { createSelector } from '@reduxjs/toolkit';

import type { GrantRequestState } from '@/features/grantRequests/grantRequestSlice';

import {
	actions,
	reducer,
	listGrantRequests,
	getGrantRequest,
	createGrantRequest,
	respondGrantRequest,
	cancelGrantRequest,
	deleteGrantRequest,
} from '@/features/grantRequests/grantRequestSlice';



const STATE_KEY = 'grantRequest';

export const grantRequestReducer = {
	[STATE_KEY]: reducer,
};

export const grantRequestActions = {
	listGrantRequests,
	getGrantRequest,
	createGrantRequest,
	respondGrantRequest,
	cancelGrantRequest,
	deleteGrantRequest,
	...actions,
};

export const selectGrantRequestState = (state: { [STATE_KEY]: GrantRequestState }) => state[STATE_KEY];

export const selectGrantRequestList = createSelector(
	selectGrantRequestState,
	(state) => state.grantRequests,
);

export const selectGrantRequestDetail = createSelector(
	selectGrantRequestState,
	(state) => state.grantRequestDetail,
);

export const selectCreateGrantRequest = createSelector(
	selectGrantRequestState,
	(state) => state.create,
);

export const selectRespondGrantRequest = createSelector(
	selectGrantRequestState,
	(state) => state.respond,
);

export const selectCancelGrantRequest = createSelector(
	selectGrantRequestState,
	(state) => state.cancel,
);

export const selectDeleteGrantRequest = createSelector(
	selectGrantRequestState,
	(state) => state.delete,
);