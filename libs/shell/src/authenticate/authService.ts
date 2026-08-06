import { ClientErrors } from '@nikkierp/common/types';
import { dispatchServiceMethod, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { shellStore } from '../appState/shellStore';
import { userContextService } from '../userContext/userContextService';


export const SLICE_NAME = t.SLICE_NAME;

export type LoginCredentials = Record<string, unknown>;

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
}

export function isAuthenticated(): boolean {
	const accessObj = accessTokenStorage?.getToken();
	return Boolean(accessObj && !accessObj.isExpired);
}

/**
 * A valid access token, refreshing it first if it has expired.
 *
 * `RequestMaker` calls this for every request, so it must stay a plain function: it runs
 * outside React and has no dispatch to reach a thunk with.
 */
export async function ensureAccessToken(): Promise<string> {
	const accessObj = accessTokenStorage.getToken();
	if (accessObj && !accessObj.isExpired) {
		return accessObj.token;
	}
	const restored = await restoreSession();
	return restored ? getAccessToken()! : '';
}

async function restoreSession(): Promise<boolean> {
	const refreshObj = refreshTokenStorage.getToken();
	if (!refreshObj || refreshObj.isExpired) {
		return false;
	}
	try {
		onSignInSuccess(await strategy.refreshSession({ refreshToken: refreshObj.token }));
		return true;
	}
	catch (error) {
		if (ClientErrors.containsAuthorizationError(error)) {
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

	@storeAsyncMethod
	public async signOut(): Promise<void> {
		await strategy.signOut();
		clearAuthSession();
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
}

export const authService = new AuthService();
