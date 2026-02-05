import * as request from '@nikkierp/common/request';

import {
	TokenObj, AuthenticatedSession, ITokenStorage, ISignInStrategy,
	SignInResult,
} from './types';


export type LoginCredentials = Record<string, unknown>;

export type InitAuthServiceParams = {
	strategy: ISignInStrategy;
	accessTokenStorage: ITokenStorage;
	refreshTokenStorage: ITokenStorage;
};

let authServiceInstance: AuthService | null = null;

export function initAuthService(params: InitAuthServiceParams): AuthService {
	return authServiceInstance = new AuthService(params);
}

export function authService(): AuthService {
	if (!authServiceInstance) {
		throw new Error('Auth service must be initialized with initAuthService() before use');
	}
	return authServiceInstance;
}

export class AuthService {
	#strategy: ISignInStrategy;
	#accessTokenStorage: ITokenStorage;
	#refreshTokenStorage: ITokenStorage;

	public constructor(params: InitAuthServiceParams) {
		this.#strategy = params.strategy;
		this.#accessTokenStorage = params.accessTokenStorage;
		this.#refreshTokenStorage = params.refreshTokenStorage;
	}

	public get sessionExpiresAt(): number {
		return this.#accessTokenStorage.getToken()?.expiresAt ?? 0;
	}

	public getAccessToken(): string | null {
		return this.#accessTokenStorage.getToken()?.token ?? null;
	}

	public startSignIn(params?: UnknownRecord): Promise<UnknownRecord> {
		return this.#strategy.startSignIn(params);
	}

	public async continueSignIn(params: UnknownRecord): Promise<SignInResult> {
		const result = await this.#strategy.continueSignIn(params);
		if (result?.done) {
			this._onSignInSuccess(result.data!);
		}
		return result;
	}

	public signOut(): void {
		request.post('logout');
		this.#accessTokenStorage.clear();
		this.#refreshTokenStorage.clear();
	}

	public async refreshSession(refreshToken: string): Promise<void> {
		const result = await this.#strategy.refreshSession(refreshToken);
		this._onSignInSuccess(result);
	}

	public async restoreAuthSession(): Promise<boolean> {
		const refreshToken = this.#refreshTokenStorage.getToken();
		const expiresAtMs = new Date(refreshToken!.expiresAt).getTime();

		if (refreshToken && expiresAtMs > Date.now()) {
			await this.refreshSession(refreshToken.token);
			return true;
		}
		return false;
	}

	private _onSignInSuccess(session: AuthenticatedSession): void {
		this.#accessTokenStorage.setToken(new TokenObj(
			session.accessToken,
			session.accessTokenExpiresAt,
		));
		if (session.refreshToken) {
			this.#refreshTokenStorage.setToken(new TokenObj(
				session.refreshToken,
				session.refreshTokenExpiresAt!,
			));
		}
	}
}
