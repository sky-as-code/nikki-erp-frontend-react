import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { adReducer } from './ad';
import { eventReducer } from './event';
import { kioskReducer } from './kiosk';
import { kioskSettingReducer } from './kioskSetting';
import { kioskTemplateReducer } from './kioskTemplate';


export const reducer = combineReducers({
	...kioskReducer,
	...adReducer,
	...eventReducer,
	...kioskSettingReducer,
	...kioskTemplateReducer,
});

export * from './kiosk';
export * from './ad';
export * from './event';
export * from './kioskSetting';
export * from './kioskTemplate';

export type VendingMachineDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
