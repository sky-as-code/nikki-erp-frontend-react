import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKioskSettings,
	getKioskSetting,
	createKioskSetting,
	updateKioskSetting,
	deleteKioskSetting,
	KioskSettingState,
	initialKioskSettingState,
} from '@/features/kioskSettings/kioskSettingSlice';


const STATE_KEY = 'kioskSetting';

export const kioskSettingReducer = {
	[STATE_KEY]: reducer,
};

export const kioskSettingActions = {
	listKioskSettings,
	getKioskSetting,
	createKioskSetting,
	updateKioskSetting,
	deleteKioskSetting,
	...actions,
};

export const selectKioskSettingState =
	(state: { [STATE_KEY]?: KioskSettingState }) => state?.[STATE_KEY] ?? initialKioskSettingState;

export const selectKioskSettingList = createSelector(
	selectKioskSettingState,
	(state) => state.list,
);

export const selectKioskSettingDetail = createSelector(
	selectKioskSettingState,
	(state) => state.detail,
);

export const selectCreateKioskSetting = createSelector(
	selectKioskSettingState,
	(state) => state.create,
);

export const selectUpdateKioskSetting = createSelector(
	selectKioskSettingState,
	(state) => state.update,
);

export const selectDeleteKioskSetting = createSelector(
	selectKioskSettingState,
	(state) => state.delete,
);

