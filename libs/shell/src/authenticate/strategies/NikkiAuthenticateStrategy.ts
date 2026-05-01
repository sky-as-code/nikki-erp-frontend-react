import * as request from '@nikkierp/common/request';

import { AuthenticatedSession, ISignInStrategy, SignInResult } from '../types';


/**
 * This strategy invokes NikkiERP Authenticate Module.
 */
export class NikkiAuthenticateStrategy implements ISignInStrategy {
	public get tokenType(): string {
		return 'Bearer';
	}

	public async startSignIn(data: StartSignInParams): Promise<StartSignInResult> {
		const response = await request.post<StartSignInResult>('authn/signin/start', { json: data, noAuth: true });
		return response;
	}

	public async continueSignIn(params?: SignInParams): Promise<SignInResult> {
		const response = await request.post<SignInResult>('authn/signin/continue', { json: params, noAuth: true });
		return response;
	}

	public async refreshSession(refreshToken: string): Promise<AuthenticatedSession> {
		const response = await request.post<AuthenticatedSession>('authn/signin/refresh', { json: { refreshToken }, noAuth: true });
		return response;
	}

	// public onAuthenticated(callback: AuthenticatedCallback): void {
	// 	callback({
	// 		accessToken: randomString(10),
	// 		accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
	// 	} as AuthenticatedSession);
	// }

	public async signOut(): Promise<void> {
		const response = await request.post<void>('authn/signout');
		return response;
	}
}

export type StartSignInParams = {
	subjectType?: string;
	username: string;
};

export type StartSignInResult = {
	attemptId: string;
	expiredAt: number;
	nextStep: string,
	email:string,
};

export type SignInParams = {
	attemptId: string;
	passwords: Record<string, unknown>;
};

export type RefreshTokenParams = {
	refreshToken: string;
};
