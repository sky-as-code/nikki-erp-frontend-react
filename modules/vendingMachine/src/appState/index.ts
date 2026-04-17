import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { eventReducer } from './event';
import { gameReducer } from './game';
import { kioskReducer } from './kiosk';
import { kioskDeviceReducer } from './kioskDevice';
import { kioskModelReducer } from './kioskModel';
import { kioskSettingReducer } from './kioskSetting';
import { paymentReducer } from './payment';
import { settingReducer } from './setting';
import { mediaPlaylistReducer } from './mediaPlaylist';
import { slideshowReducer } from './slideshow';
import { themeReducer } from './theme';


export const reducer = combineReducers({
	...kioskReducer,
	...slideshowReducer,
	...mediaPlaylistReducer,
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
export * from './slideshow';
export * from './mediaPlaylist';
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
