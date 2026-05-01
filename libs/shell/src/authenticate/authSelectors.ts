import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { getSessionExpiresAt } from './authService';
import { SLICE_NAME } from './types';

import type { RootState } from '../appState/store';


type AuthState = RootState[(typeof SLICE_NAME) & keyof RootState];

const selectAuthState = (state: RootState) => state[SLICE_NAME as keyof RootState] as AuthState;

export type AuthViewState = AuthState & {
	isLoading: boolean;
	isSignInSuccess: boolean;
	sessionExpiresAt: number | null;
	errorStartSignIn: string | null;
	errorContinueSignIn: string | null;
};

const selectAuthViewState = createSelector(
	selectAuthState,
	(s): AuthViewState => ({
		...s,
		isLoading:
			s.startSignIn.status === 'pending' ||
			s.continueSignIn.status === 'pending' ||
			s.signOut.status === 'pending' ||
			s.restoreAuthSession.status === 'pending',
		isSignInSuccess:
			s.isAuthenticated ||
			s.continueSignIn.status === 'success' ||
			s.restoreAuthSession.status === 'success',
		sessionExpiresAt: getSessionExpiresAt() || null,
		errorStartSignIn: s.startSignIn.status === 'error' ? s.startSignIn.error : null,
		errorContinueSignIn: s.continueSignIn.status === 'error' ? s.continueSignIn.error : null,
	}),
);

const selectSignInProgress = createSelector(
	selectAuthState,
	(state: AuthState) => state.startSignIn.status === 'pending' || state.continueSignIn.status === 'pending',
);
const selectIsAuthenticated = createSelector(
	selectAuthState,
	(authState: AuthState) =>
		authState.isAuthenticated,
);
const selectIsSessionRestoring = createSelector(
	selectAuthViewState,
	(authData: AuthViewState) => authData.isLoading,
);

export const useAuthState = () => useSelector(selectAuthViewState);
export const useSignInProgress = () => useSelector(selectSignInProgress);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
export const useIsSessionRestoring = () => useSelector(selectIsSessionRestoring);
