import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	reducer,
	listRevokeRequests,
	getRevokeRequest,
	createRevokeRequest,
	createRevokeRequests,
	deleteRevokeRequest,
	RevokeRequestState,
	initialState,
} from '@/features/revokeRequests/revokeRequestSlice';


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

export const selectRevokeRequestState =
	(state: { [STATE_KEY]: RevokeRequestState }) => state[STATE_KEY] ?? initialState;

export const selectRevokeRequestList = createSelector(
	selectRevokeRequestState,
	(state) => state.revokeRequests,
);

export const selectRevokeRequestDetail = createSelector(
	selectRevokeRequestState,
	(state) => state.revokeRequestDetail,
);

export const selectCreateRevokeRequest = createSelector(
	selectRevokeRequestState,
	(state) => state.create,
);

export const selectCreateManyRevokeRequest = createSelector(
	selectRevokeRequestState,
	(state) => state.createMany,
);

export const selectDeleteRevokeRequest = createSelector(
	selectRevokeRequestState,
	(state) => state.delete,
);