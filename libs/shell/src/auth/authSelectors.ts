import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { AuthState } from './authSlice';
import { UserContextState } from '../userContext';
import { selectUserContext } from '../userContext/userContextSelectors';

import type { RootState } from '../appState/store';


const selectAuthState = (state: RootState) => state.shellAuth;
const selectSignInProgress = createSelector(
	selectAuthState,
	(state: AuthState) => {
		return state.signInProgress;
	},
);
const selectIsAuthenticated = createSelector(
	selectAuthState,
	selectUserContext,
	(authData: AuthState, userContext: UserContextState) =>
		authData.isSignInSuccess && Boolean(userContext.user),
);
const selectIsSessionRestoring = createSelector(
	selectAuthState,
	selectUserContext,
	(authData: AuthState, userContext: UserContextState) =>
		authData.isLoading && authData.isSignInSuccess !== null && userContext.user === null,
);

const selectAuthenticatedStatus = createSelector(
	selectAuthState,
	selectIsAuthenticated,
	selectIsSessionRestoring,
	(state: AuthState, isAuthenticated: boolean, isSessionRestoring: boolean) => {
		if (state.sessionExpiresAt == null) return null;
		return {
			isAuthenticated,
			isLoading: state.isLoading,
			isSessionRestoring,
			sessionExpiresAt: state.sessionExpiresAt,
		};
	},
);

export const useAuthState = () => useSelector(selectAuthState);
export const useSignInProgress = () => useSelector(selectSignInProgress);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
export const useAuthenticatedStatus = () =>
	useSelector(selectAuthenticatedStatus);
