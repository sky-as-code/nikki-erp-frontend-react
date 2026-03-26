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

export const kioskSettingReducer = { [STATE_KEY]: reducer };

export const kioskSettingActions = {
	listKioskSettings,
	getKioskSetting,
	createKioskSetting,
	updateKioskSetting,
	deleteKioskSetting,
	...actions,
};

export const selectKioskSettingState = (state: { [STATE_KEY]?: KioskSettingState }) =>
	state?.[STATE_KEY] ?? initialKioskSettingState;

export const selectKioskSettingList = createSelector(
	selectKioskSettingState,
	(s) => s.list,
);

export const selectKioskSettingDetail = createSelector(
	selectKioskSettingState,
	(s) => s.detail,
);

export const selectCreateKioskSetting = createSelector(
	selectKioskSettingState,
	(s) => s.create,
);

export const selectDeleteKioskSetting = createSelector(
	selectKioskSettingState,
	(s) => s.delete,
);
