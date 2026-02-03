import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKioskDevices,
	getKioskDevice,
	createKioskDevice,
	updateKioskDevice,
	deleteKioskDevice,
	KioskDeviceState,
	initialKioskDeviceState,
} from '@/features/kioskDevices/kioskDeviceSlice';


const STATE_KEY = 'kioskDevice';

export const kioskDeviceReducer = {
	[STATE_KEY]: reducer,
};

export const kioskDeviceActions = {
	listKioskDevices,
	getKioskDevice,
	createKioskDevice,
	updateKioskDevice,
	deleteKioskDevice,
	...actions,
};

export const selectKioskDeviceState =
	(state: { [STATE_KEY]?: KioskDeviceState }) => state?.[STATE_KEY] ?? initialKioskDeviceState;

export const selectKioskDeviceList = createSelector(
	selectKioskDeviceState,
	(state) => state.list,
);

export const selectKioskDeviceDetail = createSelector(
	selectKioskDeviceState,
	(state) => state.detail,
);

export const selectCreateKioskDevice = createSelector(
	selectKioskDeviceState,
	(state) => state.create,
);

export const selectUpdateKioskDevice = createSelector(
	selectKioskDeviceState,
	(state) => state.update,
);

export const selectDeleteKioskDevice = createSelector(
	selectKioskDeviceState,
	(state) => state.delete,
);
