import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listSettings,
	getSetting,
	createSetting,
	updateSetting,
	deleteSetting,
	SettingState,
	initialSettingState,
} from '@/features/settings/settingSlice';

const STATE_KEY = 'setting';

export const settingReducer = {
	[STATE_KEY]: reducer,
};

export const settingActions = {
	listSettings,
	getSetting,
	createSetting,
	updateSetting,
	deleteSetting,
	...actions,
};

export const selectSettingState =
	(state: { [STATE_KEY]?: SettingState }) => state?.[STATE_KEY] ?? initialSettingState;

export const selectSettingList = createSelector(
	selectSettingState,
	(state) => state.list,
);

export const selectSettingDetail = createSelector(
	selectSettingState,
	(state) => state.detail,
);

export const selectCreateSetting = createSelector(
	selectSettingState,
	(state) => state.create,
);

export const selectUpdateSetting = createSelector(
	selectSettingState,
	(state) => state.update,
);

export const selectDeleteSetting = createSelector(
	selectSettingState,
	(state) => state.delete,
);
