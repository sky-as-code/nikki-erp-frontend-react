import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listDevices,
	getDevice,
	createDevice,
	updateDevice,
	deleteDevice,
	DeviceState,
	initialDeviceState,
} from '@/features/devices/deviceSlice';


const STATE_KEY = 'device';

export const deviceReducer = {
	[STATE_KEY]: reducer,
};

export const deviceActions = {
	listDevices,
	getDevice,
	createDevice,
	updateDevice,
	deleteDevice,
	...actions,
};

export const selectDeviceState =
	(state: { [STATE_KEY]?: DeviceState }) => state?.[STATE_KEY] ?? initialDeviceState;

export const selectDeviceList = createSelector(
	selectDeviceState,
	(state) => state.list,
);

export const selectDeviceDetail = createSelector(
	selectDeviceState,
	(state) => state.detail,
);

export const selectCreateDevice = createSelector(
	selectDeviceState,
	(state) => state.create,
);

export const selectUpdateDevice = createSelector(
	selectDeviceState,
	(state) => state.update,
);

export const selectDeleteDevice = createSelector(
	selectDeviceState,
	(state) => state.delete,
);
