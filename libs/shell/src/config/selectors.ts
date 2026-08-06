import { useModuleSelector } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { SLICE_NAME, ShellConfigState } from './shellConfigSlice';
import { ShellEnvVars } from '../types';


const selectShellConfig = (state: any) => state[SLICE_NAME] as ShellConfigState;

const selectEnvVars = createSelector(
	selectShellConfig,
	(state: ShellConfigState) => state.envVars,
);

/** Reads from the Shell's own store, not the default react-redux context. */
export const useShellEnvVars = (): ShellEnvVars => useModuleSelector(selectEnvVars);
