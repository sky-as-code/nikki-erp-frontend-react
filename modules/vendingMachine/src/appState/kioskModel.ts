import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKioskModels,
	getKioskModel,
	createKioskModel,
	updateKioskModel,
	deleteKioskModel,
	KioskModelState,
	initialKioskModelState,
} from '@/features/kioskModels/kioskModelSlice';


const STATE_KEY = 'kioskModel';

export const kioskModelReducer = {
	[STATE_KEY]: reducer,
};

export const kioskModelActions = {
	listKioskModels,
	getKioskModel,
	createKioskModel,
	updateKioskModel,
	deleteKioskModel,
	...actions,
};

export const selectKioskModelState = (state: { [STATE_KEY]?: KioskModelState }) =>
	state?.[STATE_KEY] ?? initialKioskModelState;

export const selectKioskModelList = createSelector(
	selectKioskModelState,
	(state) => state.list,
);

export const selectKioskModelDetail = createSelector(
	selectKioskModelState,
	(state) => state.detail,
);

export const selectCreateKioskModel = createSelector(
	selectKioskModelState,
	(state) => state.create,
);

export const selectUpdateKioskModel = createSelector(
	selectKioskModelState,
	(state) => state.update,
);

export const selectDeleteKioskModel = createSelector(
	selectKioskModelState,
	(state) => state.delete,
);
