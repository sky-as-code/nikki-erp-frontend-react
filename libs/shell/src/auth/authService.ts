import * as request from '@nikkierp/common/request';

import {
	AccessToken, AuthenticatedSession, ITokenService, ISignInStrategy,
	SignInResult,
} from './types';


export type User = {
	id: string;
	email: string;
	name: string;
	role: string;
};

export type LoginCredentials = Record<string, unknown>;

export class AuthService {
	private _strategy?: ISignInStrategy;
	private _tokenService?: ITokenService;

	public get strategy(): ISignInStrategy | undefined {
		return this._strategy;
	}

	public set strategy(strategy: ISignInStrategy) {
		this._strategy = strategy;
		this._strategy!.onAuthenticated(this._onSignInSuccess.bind(this));
	}

	public get tokenService(): ITokenService | undefined {
		return this._tokenService;
	}

	public set tokenService(tokenService: ITokenService) {
		this._tokenService = tokenService;
	}

	public startSession(params?: UnknownRecord): Promise<UnknownRecord> {
		return this._strategy!.start(params);
	}

	public async signIn(params: UnknownRecord): Promise<SignInResult> {
		const result = await this._strategy!.continue(params);
		if (result?.done) {
			this._onSignInSuccess(result.data!);
		}
		return result;
	}

	public async signOut(): Promise<void> {
		await request.post('/logout');
	}

	public async refreshToken(refreshToken: string): Promise<{ token: string }> {
		const response = await request.post<{ token: string }>('/refresh-token', {
			json: { refreshToken },
		});
		return response;
	}

	public getAccessToken(): AccessToken | null {
		return this._tokenService?.getAccessToken() ?? null;
	}

	private _onSignInSuccess(session: AuthenticatedSession): void {
		this._tokenService?.setAccessToken({
			accessToken: session.accessToken,
			accessTokenExpiresAt: session.accessTokenExpiresAt,
		});
	}

	// public async fetchProfile(): Promise<User> {
	// 	const response = await request.get<User>('/profile');
	// 	return response;
	// }
}

export const authService = new AuthService();