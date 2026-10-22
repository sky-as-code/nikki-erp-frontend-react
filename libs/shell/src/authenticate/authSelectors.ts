import { selectSliceState, useModuleSelector, useServiceLayer } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { AuthService, authService } from './authService';
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

/**
 * True while a session exists **and** the user context has loaded.
 *
 * Reads the store only. It used to check the access token in storage on every render, which
 * hid everything gated on it -- the org and module switchers first -- whenever a re-render
 * landed between the token expiring and the next request refreshing it, with nothing to bring
 * them back. An expired access token is refreshed transparently; only a failed refresh ends
 * the session, and that is dispatched as `setSessionState('none')`.
 */
export function useIsAuthenticated(): boolean {
	return useModuleSelector(selectIsAuthenticated);
}

/**
 * Loaded, or being refreshed over a context already loaded. A refresh -- after a Settings save --
 * keeps the previous data while pending; counting only `fulfilled` signed the user out for the
 * length of the request, unmounting the page they were on.
 */
function hasUserContext(getUserContext: any): boolean {
	return getUserContext?.status === 'fulfilled'
		|| (getUserContext?.status === 'pending' && getUserContext?.data != null);
}

/** True while either the token exchange or the user-context fetch is in flight. */
export function useIsAuthenticatePending(): boolean {
	return useModuleSelector(selectIsAuthenticatePending);
}

/** True once no further attempt will be made to authenticate or restore a session. */
export function useIsSessionSettled(): boolean {
	return useModuleSelector(selectIsSessionSettled);
}

export const selectIsAuthenticated = createSelector(
	selectAuthState,
	selectGetUserContext,
	(auth: any, getUserContext: any) => auth?.setSessionState !== 'none' && hasUserContext(getUserContext),
);

const selectIsAuthenticatePending = createSelector(
	selectAuthState,
	selectGetUserContext,
	(auth: any, getUserContext: any) => {
		const isSigningIn = auth?.continueSignIn?.status === 'pending'
			|| auth?.restoreAuthSession?.status === 'pending';
		// A refresh over a loaded context is not authentication: the session is already up.
		return isSigningIn || (getUserContext?.status === 'pending' && getUserContext?.data == null);
	},
);

const selectIsSessionSettled = createSelector(
	selectAuthState,
	(auth: any) => Boolean(auth?.settleSession?.data),
);
