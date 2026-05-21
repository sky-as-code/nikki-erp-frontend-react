import { setIsLocalEnv } from '@nikkierp/common/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ShellEnvVars } from '../types';


export const SLICE_NAME = 'shellConfig';

export type ShellConfigState = {
	envVars: ShellEnvVars;
};

const initialState: ShellConfigState = {
	envVars: {
		BASE_API_URL: '',
		APP_ENV: null,
		ROOT_DOMAIN: '',
		ROOT_PATH: '',
	},
};

const shellConfigSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setEnvVars: (state, action: PayloadAction<ShellEnvVars>) => {
			state.envVars = action.payload;
			setIsLocalEnv(action.payload.APP_ENV === 'local');
		},
	},
});

export const {
	setEnvVars: setEnvVarsAction,
} = shellConfigSlice.actions;

export const { reducer } = shellConfigSlice;
