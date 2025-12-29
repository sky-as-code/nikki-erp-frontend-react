import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listRevokeRequests,
	getRevokeRequest,
	createRevokeRequest,
	createRevokeRequests,
	deleteRevokeRequest,
	type RevokeRequestState,
} from '@/features/revoke_requests/revokeRequestSlice';


const STATE_KEY = 'revokeRequest';

export const revokeRequestReducer = {
	[STATE_KEY]: reducer,
};

export const revokeRequestActions = {
	listRevokeRequests,
	getRevokeRequest,
	createRevokeRequest,
	createRevokeRequests,
	deleteRevokeRequest,
	...actions,
};

export const selectRevokeRequestState = (state: { [STATE_KEY]: RevokeRequestState }) => state[STATE_KEY];

export const selectRevokeRequestList = createSelector(
	selectRevokeRequestState,
	(state) => state.revokeRequests,
);

export const selectRevokeRequestDetail = createSelector(
	selectRevokeRequestState,
	(state) => state.revokeRequestDetail,
);

