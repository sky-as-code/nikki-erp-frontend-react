import * as request from '@nikkierp/common/request';
import * as uiState from '@nikkierp/ui/appState';

import * as t from './types';
import { getUserContext } from '../userContext';


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


export function getSessionExpiresAt(): number {
	return accessTokenStorage.getToken()?.expiresAt ?? 0;
}

export function getAccessToken(): string | null {
	return accessTokenStorage.getToken()?.token ?? null;
}

export function clearAuthSession(): void {
	accessTokenStorage.clear();
	refreshTokenStorage.clear();
}

export const startSignIn = uiState.createThunkPack<UnknownRecord, UnknownRecord, 'startSignIn'>(
	t.SLICE_NAME, 'startSignIn',
	async function startSignInThunk(params: UnknownRecord) {
		return strategy.startSignIn(params);
	},
);

export const continueSignIn = uiState.createThunkPack<t.SignInResult, UnknownRecord, 'continueSignIn'>(
	t.SLICE_NAME, 'continueSignIn',
	async function continueSignInThunk(params: UnknownRecord, { dispatch }) {
		const result = await strategy.continueSignIn(params);
		if (result?.done) {
			onSignInSuccess(result.data!);
			dispatch(getUserContext.action());
		}
		return result;
	},
);

export const refreshSession = uiState.createThunkPack<t.AuthenticatedSession, string, 'refreshSession'>(
	t.SLICE_NAME, 'refreshSession',
	async function refreshSessionThunk(refreshToken: string) {
		const result = await strategy.refreshSession(refreshToken);
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
	restoreSession,
);

export async function ensureAccessToken(): Promise<string> {
	const accessObj = accessTokenStorage.getToken();
	if (accessObj && accessObj.expiresAt > Date.now()) {
		return accessObj.token;
	}
	const restored = restoreSession();
	if (!restored) {
		throw new Error('Unauthenticated');
	}
	return getAccessToken()!;
}

async function restoreSession(): Promise<boolean> {
	const refreshToken = refreshTokenStorage.getToken();
	if (!refreshToken) {
		return false;
	}
	const expiresAtMs = new Date(refreshToken.expiresAt).getTime();
	if (expiresAtMs <= Date.now()) {
		return false;
	}
	const session = await strategy.refreshSession(refreshToken.token);
	onSignInSuccess(session);
	return true;
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
