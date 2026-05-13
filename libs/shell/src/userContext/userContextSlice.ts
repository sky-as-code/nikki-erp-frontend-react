import * as uiState from '@nikkierp/ui/appState';
import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import {
	LocalSettings, SLICE_NAME, LOCAL_SETTINGS_STORAGE_KEY,
} from './types';
import * as svc from './userContextService';


export { SLICE_NAME };

export type UserContextState = typeof initialState;


const initialState = {
	[svc.getUserContext.stateKey]: svc.getUserContext.initialState,
	[svc.setLocalSettings.stateKey]: {
		...svc.setLocalSettings.initialState,
		data: loadSavedLocalSettings(),
	} as uiState.ReduxThunkState<LocalSettings>,
};

const userContextSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		svc.getUserContext.buildThunkReducers(builder);
		svc.setLocalSettings.buildThunkReducers(builder);
	},
});

function loadSavedLocalSettings(): LocalSettings | null {
	const settingsStr = localStorage.getItem(LOCAL_SETTINGS_STORAGE_KEY);
	if (!settingsStr) return {
		languageCode: null,
		themeMode: 'light',
	};
	return JSON.parse(atob(settingsStr)) as LocalSettings;
}

export const actions = {
	[svc.getUserContext.stateKey]: svc.getUserContext.thunkAction,
	[svc.setLocalSettings.stateKey]: svc.setLocalSettings.thunkAction,
};

export const { reducer } = userContextSlice;

export type UserContextDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;

export function useUserCxtDispatch(): UserContextDispatch {
	return useDispatch<UserContextDispatch>();
}
