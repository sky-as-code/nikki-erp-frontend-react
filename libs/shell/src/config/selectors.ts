import { useModuleSelector } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { SLICE_NAME, ShellConfigState } from './shellConfigSlice';
import { ShellEnvVars } from '../types';


const EMPTY_ENV_VARS: ShellEnvVars = {
	BASE_API_URL: '',
	APP_ENV: null,
	ROOT_DOMAIN: '',
	ROOT_PATH: '',
};

// `useModuleSelector` resolves whichever store is in scope. Inside a micro-app that is the
// module's own store, which never carries the Shell's `shellConfig` slice, so the lookup is
// undefined rather than a `ShellConfigState`. Fall back to empty vars instead of throwing —
// callers already treat missing values as "unconfigured" and supply their own defaults.
const selectShellConfig = (state: any) => state?.[SLICE_NAME] as ShellConfigState | undefined;

const selectEnvVars = createSelector(
	selectShellConfig,
	(state: ShellConfigState | undefined) => state?.envVars ?? EMPTY_ENV_VARS,
);

/** Reads from the Shell's own store, not the default react-redux context. */
export const useShellEnvVars = (): ShellEnvVars => useModuleSelector(selectEnvVars);
