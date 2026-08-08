import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { useIsMicroApp, useRootSelector } from '../microApp';


const AUTH_SLICE_KEY = 'shell.authenticate';

const selectAuthState = (state: any) => state[AUTH_SLICE_KEY] as any;
const selectUserContext = (state: any) => state.shellUserContext;

const selectIsAuthenticated = createSelector(
	selectAuthState,
	selectUserContext,
	(authData: any, userContext: any) =>
		authData.isSignInSuccess && Boolean(userContext.user),
);

export function useIsAuthenticated(): boolean {
	const isMicroApp = useIsMicroApp();
	if (isMicroApp) {
		return useRootSelector(selectIsAuthenticated);
	}
	return useSelector(selectIsAuthenticated);
}