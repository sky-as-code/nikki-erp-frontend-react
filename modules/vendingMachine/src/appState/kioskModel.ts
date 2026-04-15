import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKioskModels,
	getKioskModel,
	createKioskModel,
	updateKioskModel,
	deleteKioskModel,
	setArchivedKioskModel,
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
	setArchivedKioskModel,
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

export const selectSetArchivedKioskModel = createSelector(
	selectKioskModelState,
	(state) => state.archive,
);

export const selectKioskModelListPagination = createSelector(
	selectKioskModelState,
	(state) => state.listPagination,
);
