import { ReduxThunkState } from '@nikkierp/ui/appState';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import * as svc from './authService';
import { SLICE_NAME } from './types';
import { selectGetUserContext } from '../userContext';

import type { RootState } from '../appState/store';


type AuthState = RootState[(typeof SLICE_NAME) & keyof RootState];

// export type AuthViewState = AuthState & {
// 	isLoading: boolean;
// 	isSignInSuccess: boolean;
// 	sessionExpiresAt: number | null;
// 	errorStartSignIn: string | null;
// 	errorContinueSignIn: string | null;
// };

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
export function useSettleSession() {
	return svc.settleSession.useHook(useSelector);
}


export function useAuthState() {
	return useSelector(selectAuthState);
}

//** Is both fetching access token and fetching user context are completed */
export function useIsAuthenticated() {
	return useSelector(selectIsAuthenticated);
}

//** Is either fetching access token or fetching user context is in progress */
export function useIsAuthenticatePending() {
	return useSelector(selectIsAuthenticatePending);
}

//** Indicates there is no more attempt to authenticate or restore session */
export function useIsSessionSettled() {
	return useSelector(selectIsSessionSettled);
}



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

function selectAuthState(state: RootState) {
	return state[SLICE_NAME as keyof RootState] as AuthState;
}

const selectIsSessionSettled = createSelector(
	selectAuthState,
	(authState: AuthState) => Boolean(authState.settleSession.data),
);
