import { createSelector } from '@reduxjs/toolkit';

import { grantRequestActions, grantRequestReducer } from '../features/grant_requests/grantRequestSlice';

import type { GrantRequestState } from '../features/grant_requests';


const sliceKey = 'grantRequests';

export const grantRequestReducers = {
	[sliceKey]: grantRequestReducer,
};

const selectState = (state: { [sliceKey]: GrantRequestState }) => state[sliceKey];

export const selectGrantRequestState = createSelector(selectState, (state) => state);
export const selectGrantRequestList = createSelector(selectState, (state) => state.items);

export { grantRequestActions };

