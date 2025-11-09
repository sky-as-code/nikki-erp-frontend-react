import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { useIsMicroApp, useRootSelector } from '../microApp';


const selectAuthState = (state: any) => state.shellAuth as any;
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