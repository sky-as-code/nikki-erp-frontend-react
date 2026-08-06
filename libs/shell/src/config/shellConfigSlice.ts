import { setIsLocalEnv } from '@nikkierp/common/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { shellStore } from '../appState/shellStore';
import { ShellEnvVars } from '../types';


export const SLICE_NAME = 'shellConfig';

export type ShellConfigState = {
	envVars: ShellEnvVars,
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

// Stays a plain slice rather than a `@storeService` class: `setEnvVars` is a single
// synchronous assignment, and its `setIsLocalEnv` side effect has to land before the
// first render — not after a thunk resolves.
shellStore.injectSliceReducer(SLICE_NAME, reducer);
