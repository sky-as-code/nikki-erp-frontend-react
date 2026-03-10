import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { adReducer } from './ad';
import { eventReducer } from './event';
import { gameReducer } from './game';
import { kioskReducer } from './kiosk';
import { kioskDeviceReducer } from './kioskDevice';
import { kioskModelReducer } from './kioskModel';
import { kioskSettingReducer } from './kioskSetting';
import { paymentReducer } from './payment';
import { settingReducer } from './setting';
import { themeReducer } from './theme';


export const reducer = combineReducers({
	...kioskReducer,
	...adReducer,
	...eventReducer,
	...settingReducer,
	...kioskModelReducer,
	...kioskSettingReducer,
	...kioskDeviceReducer,
	...paymentReducer,
	...themeReducer,
	...gameReducer,
});

export * from './kiosk';
export * from './ad';
export * from './event';
export * from './setting';
export * from './kioskModel';
export * from './kioskSetting';
export * from './kioskDevice';
export * from './payment';
export * from './theme';
export * from './game';

export type VendingMachineDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
