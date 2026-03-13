import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listAds,
	getAd,
	createAd,
	updateAd,
	deleteAd,
	AdState,
	initialAdState,
} from '@/features/ads/adSlice';


const STATE_KEY = 'ad';

export const adReducer = {
	[STATE_KEY]: reducer,
};

export const adActions = {
	listAds,
	getAd,
	createAd,
	updateAd,
	deleteAd,
	...actions,
};

export const selectAdState = (state: { [STATE_KEY]?: AdState }) => state?.[STATE_KEY] ?? initialAdState;

export const selectAdList = createSelector(
	selectAdState,
	(state) => state.list,
);

export const selectAdDetail = createSelector(
	selectAdState,
	(state) => state.detail,
);

export const selectCreateAd = createSelector(
	selectAdState,
	(state) => state.create,
);

export const selectUpdateAd = createSelector(
	selectAdState,
	(state) => state.update,
);

export const selectDeleteAd = createSelector(
	selectAdState,
	(state) => state.delete,
);

