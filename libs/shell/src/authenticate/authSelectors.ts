import { selectSliceState, useModuleSelector, useServiceLayer } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { AuthService, authService, isAuthenticated } from './authService';
import { selectGetUserContext } from '../userContext/userContextSelectors';


const selectAuthState = selectSliceState(AuthService);

export function useStartSignIn() {
	return useServiceLayer(authService.startSignIn).result;
}
export function useContinueSignIn() {
	return useServiceLayer(authService.continueSignIn).result;
}
export function useSignOut() {
	return useServiceLayer(authService.signOut);
}
export function useRestoreAuthSession() {
	return useServiceLayer(authService.restoreAuthSession);
}
export function useSettleSession() {
	return useServiceLayer(authService.settleSession);
}

export function useAuthState() {
	return useModuleSelector(selectAuthState);
}

/** True once the access token is valid **and** the user context has loaded. */
export function useIsAuthenticated(): boolean {
	const getUserContext = useModuleSelector(selectGetUserContext);
	// `isAuthenticated()` reads localStorage, so it is called on every render rather than
	// from inside a `createSelector`. Memoizing it on user-context state — as this used to
	// — meant a token expiring in place never invalidated the cached answer.
	return isAuthenticated() && getUserContext?.status === 'fulfilled';
}

/** True while either the token exchange or the user-context fetch is in flight. */
export function useIsAuthenticatePending(): boolean {
	return useModuleSelector(selectIsAuthenticatePending);
}

/** True once no further attempt will be made to authenticate or restore a session. */
export function useIsSessionSettled(): boolean {
	return useModuleSelector(selectIsSessionSettled);
}

const selectIsAuthenticatePending = createSelector(
	selectAuthState,
	selectGetUserContext,
	(auth: any, getUserContext: any) => {
		const isSigningIn = auth?.continueSignIn?.status === 'pending'
			|| auth?.restoreAuthSession?.status === 'pending';
		return isSigningIn || getUserContext?.status === 'pending';
	},
);

const selectIsSessionSettled = createSelector(
	selectAuthState,
	(auth: any) => Boolean(auth?.settleSession?.data),
);
