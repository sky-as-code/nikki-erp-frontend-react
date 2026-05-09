import { ReduxThunkState } from '@nikkierp/ui/appState';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import * as svc from './authService';
import { SLICE_NAME } from './types';
import { UserContextState, selectGetUserContext } from '../userContext';

import type { RootState } from '../appState/store';


type AuthState = RootState[(typeof SLICE_NAME) & keyof RootState];

const selectAuthState = (state: RootState) => state[SLICE_NAME as keyof RootState] as AuthState;

export function useStartSignIn() {
	return svc.startSignIn.useHook(useSelector);
}
export function useContinueSignIn() {
	return svc.continueSignIn.useHook(useSelector);
}
export function useSignOut() {
	return svc.signOut.useHook(useSelector);
}
export function useRestoreAuthSession() {
	return svc.restoreAuthSession.useHook(useSelector);
}

export type AuthViewState = AuthState & {
	isLoading: boolean;
	isSignInSuccess: boolean;
	sessionExpiresAt: number | null;
	errorStartSignIn: string | null;
	errorContinueSignIn: string | null;
};

// const selectAuthViewState = createSelector(
// 	selectAuthState,
// 	(s): AuthViewState => ({
// 		...s,
// 		isLoading:
// 			s.startSignIn.status === 'pending' ||
// 			s.continueSignIn.status === 'pending' ||
// 			s.signOut.status === 'pending' ||
// 			s.restoreAuthSession.status === 'pending',
// 		isSignInSuccess:
// 			s.isAuthenticated ||
// 			s.continueSignIn.status === 'success' ||
// 			s.restoreAuthSession.status === 'success',
// 		sessionExpiresAt: svc.getSessionExpiresAt() || null,
// 		errorStartSignIn: s.startSignIn.status === 'error' ? s.startSignIn.error : null,
// 		errorContinueSignIn: s.continueSignIn.status === 'error' ? s.continueSignIn.error : null,
// 	}),
// );

// const selectSignInProgress = createSelector(
// 	selectAuthState,
// 	(state: AuthState) => state.startSignIn.status === 'pending' || state.continueSignIn.status === 'pending',
// );

const selectIsAuthenticated = createSelector(
	selectGetUserContext,
	(getUserContext: ReduxThunkState) => {
		const hasUserContext = (getUserContext.isDone);
		return svc.isAuthenticated() && hasUserContext;
	},
);

const selectIsAuthenticatePending = createSelector(
	svc.continueSignIn.selector,
	svc.restoreAuthSession.selector,
	selectGetUserContext,
	(continueSignIn: ReduxThunkState, restoreAuthSession: ReduxThunkState, getUserContext: ReduxThunkState) => {
		const isSigningIn = (continueSignIn.isLoading || restoreAuthSession.isLoading);
		const isFetchingContext = (getUserContext.isLoading);
		return isSigningIn || isFetchingContext;
	},
);

// const selectIsSessionRestoring = createSelector(
// 	svc.restoreAuthSession.selector,
// 	(state: ReduxThunkState) => state.status === 'pending',
// );

// export const useAuthState = () => useSelector(selectAuthViewState);
// export const useSignInProgress = () => useSelector(selectSignInProgress);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
export const useIsAuthenticatePending = () => useSelector(selectIsAuthenticatePending);
// export const useIsSessionRestoring = () => useSelector(selectIsSessionRestoring);
