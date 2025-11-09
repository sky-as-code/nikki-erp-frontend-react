import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { RootState } from '../appState/store';


const selectShellConfig = (state: RootState) => state.shellConfig;
const selectEnvVars = createSelector(
	selectShellConfig,
	(state) => state.envVars,
);

export const useShellEnvVars = () => useSelector(selectEnvVars);
