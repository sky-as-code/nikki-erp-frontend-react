import { ClientErrors } from '@nikkierp/common/types';
import {
	dispatchServiceMethod, storeAsyncMethod, storeService, storeSyncMethod,
} from '@nikkierp/ui/appState/store';

import * as t from './types';
import { shellStore } from '../appState/shellStore';
import { userContextService } from '../userContext/userContextService';


export const SLICE_NAME = t.SLICE_NAME;

export type LoginCredentials = Record<string, unknown>;

/** `null` until the first token write or refresh failure; `'none'` once a session is lost. */
export type SessionState = 'active' | 'none';

export type InitAuthServiceParams = {
	strategy: t.ISignInStrategy,
	accessTokenStorage: t.ITokenStorage,
	refreshTokenStorage: t.ITokenStorage,
};

// Module-level rather than instance fields: the helpers below are called from outside
// React and outside Redux (`RequestMaker.initDefault`, `useApiOptions`), where there is
// no dispatch and no way to reach the service instance.
let strategy: t.ISignInStrategy;
let accessTokenStorage: t.ITokenStorage;
let refreshTokenStorage: t.ITokenStorage;
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Refreshes this long before expiry, so a token that passes the client check is not refused by
 * the server a moment later -- which would send the user to `/signin` for no reason.
 */
const ACCESS_TOKEN_REFRESH_MARGIN_MS = 30_000;


export function initAuthService(params: InitAuthServiceParams): void {
	strategy = params.strategy;
	accessTokenStorage = params.accessTokenStorage;
	refreshTokenStorage = params.refreshTokenStorage;
}

// These are reachable over the command bus, which is registered before
// `initAuthService` has necessarily run, so each tolerates an uninitialized storage
// rather than throwing at a caller that only asked whether a session exists.
export function getSessionExpiresAt(): Date | null {
	return accessTokenStorage?.getToken()?.expiresAt ?? null;
}

export function getAccessToken(): string | null {
	return accessTokenStorage?.getToken()?.token ?? null;
}

export function clearAuthSession(): void {
	accessTokenStorage?.clear();
	refreshTokenStorage?.clear();
	markSession('none');
}

/**
 * Whether a usable session exists: a live access token, or a refresh token to get one.
 *
 * Not for render gating -- storage is invisible to React. Components use `useIsAuthenticated`.
 */
export function isAuthenticated(): boolean {
	const accessObj = accessTokenStorage?.getToken();
	const refreshObj = refreshTokenStorage?.getToken();
	return Boolean((accessObj && !accessObj.isExpired) || (refreshObj && !refreshObj.isExpired));
}

/**
 * A valid access token, refreshing it first if it has expired.
 *
 * `RequestMaker` calls this for every request, so it must stay a plain function: it runs
 * outside React and has no dispatch to reach a thunk with.
 */
export async function ensureAccessToken(): Promise<string> {
	const accessObj = accessTokenStorage.getToken();
	if (accessObj && !accessObj.isExpiringWithin(ACCESS_TOKEN_REFRESH_MARGIN_MS)) {
		return accessObj.token;
	}
	try {
		const restored = await refreshOnce();
		return restored ? getAccessToken()! : '';
	}
	catch (error) {
		// A transient refresh failure inside the margin: the current token still works.
		if (accessObj && !accessObj.isExpired) return accessObj.token;
		throw error;
	}
}

/** Every request racing past an expired token shares one refresh call. */
function refreshOnce(): Promise<boolean> {
	refreshInFlight ??= restoreSession().finally(() => {
		refreshInFlight = null;
	});
	return refreshInFlight;
}

/** A thrown error is a technical failure, not a refusal, so it leaves the session state alone. */
async function restoreSession(): Promise<boolean> {
	const refreshObj = refreshTokenStorage.getToken();
	if (!refreshObj || refreshObj.isExpired) {
		markSession('none');
		return false;
	}
	try {
		onSignInSuccess(await strategy.refreshSession({ refreshToken: refreshObj.token }));
		return true;
	}
	catch (error) {
		if (ClientErrors.containsAuthorizationError(error)) {
			markSession('none');
			return false;
		}
		throw error;
	}
}

function onSignInSuccess(session: t.AuthenticatedSession): void {
	accessTokenStorage.setToken(new t.TokenObj(session.accessToken, session.accessTokenExpiresAt));
	if (session.refreshToken) {
		refreshTokenStorage.setToken(new t.TokenObj(session.refreshToken, session.refreshTokenExpiresAt!));
	}
	markSession('active');
}

/**
 * Tokens live in storage, which React cannot observe, so every change in whether a session
 * exists is also dispatched. `useIsAuthenticated` reads this rather than the token: an expired
 * access token is not a lost session -- the next request refreshes it -- only a failed refresh is.
 */
function markSession(state: SessionState): void {
	if (authService.readSessionState() === state) return;
	void dispatchServiceMethod(authService.setSessionState, state);
}


/** Sign-in, sign-out and session restoration. */
@storeService(SLICE_NAME, shellStore)
export class AuthService {
	@storeAsyncMethod
	public async startSignIn(params: t.StartSignInParams): Promise<t.StartSignInResult> {
		return strategy.startSignIn(params);
	}

	/**
	 * Completes sign-in and, on success, loads the user context.
	 *
	 * Dispatched rather than called directly: a bare `userContextService.getUserContext()`
	 * runs the fetch but records nothing, and `useIsAuthenticated` gates on that slice
	 * reaching `fulfilled`.
	 */
	@storeAsyncMethod
	public async continueSignIn(params: t.SignInParams): Promise<t.SignInResult> {
		const result = await strategy.continueSignIn(params);
		if (result?.done) {
			onSignInSuccess(result.data!);
			await dispatchServiceMethod(userContextService.getUserContext);
		}
		return result;
	}

	@storeAsyncMethod
	public async refreshSession(params: t.RefreshTokenParams): Promise<t.AuthenticatedSession> {
		const result = await strategy.refreshSession(params);
		onSignInSuccess(result);
		return result;
	}

	/** The local session is cleared even when the strategy fails: a user who asked to leave must be signed out. */
	@storeAsyncMethod
	public async signOut(): Promise<void> {
		try {
			await strategy.signOut();
		}
		finally {
			clearAuthSession();
		}
	}

	/**
	 * Restores a session from the stored refresh token, then settles.
	 *
	 * Both steps are dispatched, not called: the Shell gates its entire render tree on
	 * `settleSession`'s slice data, so a direct call leaves the app blank forever.
	 *
	 * The context is awaited before settling rather than loaded in a detached microtask.
	 * `useIsAuthenticated` requires `getUserContext` to be fulfilled, so settling first
	 * would publish a torn state — `PrivateLayout` would see a truthy `restore.data`
	 * alongside a false `isAuthenticated` and would neither render nor redirect. Settling
	 * last costs one round trip before first paint and makes the signal mean what it says.
	 */
	@storeAsyncMethod
	public async restoreAuthSession(): Promise<boolean> {
		const accessToken = await ensureAccessToken();
		if (!accessToken) {
			await dispatchServiceMethod(this.settleSession);
			return false;
		}

		await dispatchServiceMethod(userContextService.getUserContext);
		await dispatchServiceMethod(this.settleSession);

		return true;
	}

	/**
	 * Marks that no further attempt will be made to authenticate or restore.
	 *
	 * Components gate on this to know whether reading the user context is meaningful yet,
	 * or whether they should keep waiting.
	 */
	@storeAsyncMethod
	public async settleSession(): Promise<boolean> {
		return true;
	}

	/** Written by the token helpers above, not by callers. */
	@storeSyncMethod
	public setSessionState(state: SessionState): SessionState {
		return state;
	}

	public readSessionState(): SessionState | null {
		const slice = shellStore.getState()[SLICE_NAME] as { setSessionState?: SessionState | null } | undefined;
		return slice?.setSessionState ?? null;
	}
}

export const authService = new AuthService();
