import * as request from '@nikkierp/common/request';
import { delay, randomString } from '@nikkierp/common/utils';

import { AuthenticatedCallback, AuthenticatedSession, ISignInStrategy, SignInResult } from '../types';


export type SignInAttempt = {
	attemptId: string;
	expiredAt: number;
	nextStep: string,
	email:string,
};

export type SignInAttemptRequest = {
	subjectType: string;
	username: string;
};

export type SignInContinueParams = {
	attemptId: string;
	username: string;
	passwords: Record<string, unknown>;
};

export type SignInContinueResult = SignInResult & {
	nextStep?: string;
};

export type RefreshTokenParams = {
	refreshToken: string;
};

/**
 * This strategy invokes NikkiERP Authenticate Module.
 */
export class NikkiAuthenticateStrategy implements ISignInStrategy {
	public get tokenType(): string {
		return 'Bearer';
	}

	public async startSignIn(data: SignInAttemptRequest): Promise<SignInAttempt> {
		const response = await request.post<SignInAttempt>('authn/login/start', { json: data,
			headers: { 'Authorization': '' },
		});
		response.nextStep = 'password';
		response.email = data.username;
		return response;
	}

	public async continueSignIn(params?: SignInContinueParams): Promise<SignInContinueResult> {
		const response = await request.post<SignInContinueResult>('authn/login', { json: params });
		return {
			done: response.done,
			data: response.data,
		};
	}

	public async refreshSession(refreshToken: string): Promise<AuthenticatedSession> {
		const response = await request.post<AuthenticatedSession>('authn/refresh', { json: { refreshToken } });
		return response;
	}

	public onAuthenticated(callback: AuthenticatedCallback): void {
		callback({
			accessToken: randomString(10),
			accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
		} as AuthenticatedSession);
	}
}
