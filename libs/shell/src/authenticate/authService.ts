import { ClientErrors } from '@nikkierp/common/types';
import * as uiState from '@nikkierp/ui/appState';

import * as t from './types';
import * as userCxtSvc from '../userContext/userContextService';


export type LoginCredentials = Record<string, unknown>;

export type InitAuthServiceParams = {
	strategy: t.ISignInStrategy;
	accessTokenStorage: t.ITokenStorage;
	refreshTokenStorage: t.ITokenStorage;
};

// let authServiceInstance: AuthService | null = null;

let strategy: t.ISignInStrategy;
let accessTokenStorage: t.ITokenStorage;
let refreshTokenStorage: t.ITokenStorage;


export function initAuthService(params: InitAuthServiceParams): void {
	strategy = params.strategy;
	accessTokenStorage = params.accessTokenStorage;
	refreshTokenStorage = params.refreshTokenStorage;
}


export function getSessionExpiresAt(): Date | null {
	return accessTokenStorage.getToken()?.expiresAt ?? null;
}

export function getAccessToken(): string | null {
	return accessTokenStorage.getToken()?.token ?? null;
}

export function clearAuthSession(): void {
	accessTokenStorage.clear();
	refreshTokenStorage.clear();
}

export const startSignIn = uiState.createThunkPack<t.StartSignInResult, t.StartSignInParams, 'startSignIn'>(
	t.SLICE_NAME, 'startSignIn',
	async function startSignInThunk(params: t.StartSignInParams) {
		return strategy.startSignIn(params);
	},
);

export const continueSignIn = uiState.createThunkPack<t.SignInResult, t.SignInParams, 'continueSignIn'>(
	t.SLICE_NAME, 'continueSignIn',
	async function continueSignInThunk(params: t.SignInParams, { dispatch }) {
		const result = await strategy.continueSignIn(params);
		if (result?.done) {
			onSignInSuccess(result.data!);
			dispatch(userCxtSvc.getUserContext.action());
		}
		return result;
	},
);

export const refreshSession = uiState.createThunkPack<t.AuthenticatedSession, t.RefreshTokenParams, 'refreshSession'>(
	t.SLICE_NAME, 'refreshSession',
	async function refreshSessionThunk(params: t.RefreshTokenParams) {
		const result = await strategy.refreshSession(params);
		onSignInSuccess(result);
		return result;
	},
);


export const signOut = uiState.createThunkPack<void, void, 'signOut'>(
	t.SLICE_NAME, 'signOut',
	async function signOutThunk() {
		await strategy.signOut();
		clearAuthSession();
		return;
	},
);

export const restoreAuthSession = uiState.createThunkPack<boolean, void, 'restoreAuthSession'>(
	t.SLICE_NAME, 'restoreAuthSession',
	async function restoreSession(_, { dispatch }): Promise<boolean> {
		const refreshObj = refreshTokenStorage.getToken();
		if (!refreshObj || refreshObj.isExpired) {
			return false;
		}
		const session = await strategy.refreshSession({ refreshToken: refreshObj.token });
		onSignInSuccess(session);
		dispatch(userCxtSvc.getUserContext.action());
		return true;
	},
);

export async function ensureAccessToken(): Promise<string> {
	const accessObj = accessTokenStorage.getToken();
	if (accessObj && !accessObj.isExpired) {
		return accessObj.token;
	}
	const restored = await restoreSession();
	if (!restored) {
		return '';
	}
	return getAccessToken()!;
}

async function restoreSession(): Promise<boolean> {
	const refreshObj = refreshTokenStorage.getToken();
	if (!refreshObj) {
		return false;
	}
	if (refreshObj.isExpired) {
		return false;
	}
	try {
		const session = await strategy.refreshSession({ refreshToken: refreshObj.token });
		onSignInSuccess(session);
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
	accessTokenStorage.setToken(new t.TokenObj(
		session.accessToken,
		session.accessTokenExpiresAt,
	));
	if (session.refreshToken) {
		refreshTokenStorage.setToken(new t.TokenObj(
			session.refreshToken,
			session.refreshTokenExpiresAt!,
		));
	}
}

export function isAuthenticated(): boolean {
	const accessObj = accessTokenStorage.getToken();
	if (!accessObj) {
		return false;
	}
	if (accessObj.isExpired) {
		return false;
	}
	return true;
}