import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listEntitlements,
	getEntitlement,
	createEntitlement,
	updateEntitlement,
	deleteEntitlement,
	EntitlementState,
} from '../features/entitlements/entitlementSlice';


const STATE_KEY = 'entitlement';

export const entitlementReducer = {
	[STATE_KEY]: reducer,
};

export const entitlementActions = {
	listEntitlements,
	getEntitlement,
	createEntitlement,
	updateEntitlement,
	deleteEntitlement,
	...actions,
};

export const selectEntitlementState = (state: { [STATE_KEY]: EntitlementState }) => state[STATE_KEY];

export const selectEntitlementList = createSelector(
	selectEntitlementState,
	(state) => state.entitlements,
);

export const selectEntitlementDetail = createSelector(
	selectEntitlementState,
	(state) => state.entitlementDetail,
);

