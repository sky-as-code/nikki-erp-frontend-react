import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKioskTemplates,
	getKioskTemplate,
	createKioskTemplate,
	updateKioskTemplate,
	deleteKioskTemplate,
	KioskTemplateState,
	initialKioskTemplateState,
} from '@/features/kioskTemplate/kioskTemplateSlice';


const STATE_KEY = 'kioskTemplate';

export const kioskTemplateReducer = {
	[STATE_KEY]: reducer,
};

export const kioskTemplateActions = {
	listKioskTemplates,
	getKioskTemplate,
	createKioskTemplate,
	updateKioskTemplate,
	deleteKioskTemplate,
	...actions,
};

export const selectKioskTemplateState =
	(state: { [STATE_KEY]?: KioskTemplateState }) => state?.[STATE_KEY] ?? initialKioskTemplateState;

export const selectKioskTemplateList = createSelector(
	selectKioskTemplateState,
	(state) => state.list,
);

export const selectKioskTemplateDetail = createSelector(
	selectKioskTemplateState,
	(state) => state.detail,
);

export const selectCreateKioskTemplate = createSelector(
	selectKioskTemplateState,
	(state) => state.create,
);

export const selectUpdateKioskTemplate = createSelector(
	selectKioskTemplateState,
	(state) => state.update,
);

export const selectDeleteKioskTemplate = createSelector(
	selectKioskTemplateState,
	(state) => state.delete,
);

