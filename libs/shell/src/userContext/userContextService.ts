import * as request from '@nikkierp/common/request';
import * as uiState from '@nikkierp/ui/appState';

import {
	GetUserContextResponse, LocalSettings, SLICE_NAME, LOCAL_SETTINGS_STORAGE_KEY, toUserContext, UserContext,
} from './types';


export const getUserContext = uiState.createThunkPack<UserContext, void, 'getUserContext'>(
	SLICE_NAME, 'getUserContext',
	async function getUserContextThunk(_, { dispatch }): Promise<UserContext> {
		const data = await request.get<GetUserContextResponse>('v1/identity/me/context');
		const userContext = toUserContext(data);
		dispatch(setLocalSettings.thunkAction({
			languageCode: userContext.accountSettings.language.isoCode,
			themeMode: userContext.accountSettings.themeMode,
		}));
		return userContext;
	},
);

export const setLocalSettings = uiState.createThunkPack<LocalSettings, LocalSettings, 'setLocalSettings'>(
	SLICE_NAME, 'setLocalSettings',
	async function setLocalSettingsThunk(input: LocalSettings): Promise<LocalSettings> {
		const jsonStr = btoa(JSON.stringify(input));
		localStorage.setItem(LOCAL_SETTINGS_STORAGE_KEY, jsonStr);
		return input;
	},
);
