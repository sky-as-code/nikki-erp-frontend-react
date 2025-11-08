import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { useIsMicroApp, useRootSelector } from '../microApp';


const selectAuthData = (state: any) => state.shellAuth as any;
const selectIsAuthenticated = createSelector(selectAuthData, (state: any) => state.isAuthenticated as boolean);

export function useIsAuthenticated(): boolean {
	const isMicroApp = useIsMicroApp();
	if (isMicroApp) {
		return useRootSelector(selectIsAuthenticated);
	}
	return useSelector(selectIsAuthenticated);
}