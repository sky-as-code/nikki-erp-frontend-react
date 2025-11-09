import { delay, randomString } from '@nikkierp/common/utils';

import { AuthenticatedCallback, AuthenticatedSession, ISignInStrategy, SignInResult, TokenObj } from '../types';


export type SignInAttempt = {
	attemptId: string;
	attemptExpiredAt: number;
	nextStep: string,
};

export type SignInContinueParams = {
	attemptId: string;
	passwords: Record<string, unknown>;
};

export type SignInContinueResult = SignInResult & {
	nextStep?: string;
};
/**
 * This strategy invokes NikkiERP Authenticate Module.
 */
export class NikkiAuthenticateStrategy implements ISignInStrategy {
	public get tokenType(): string {
		return 'Bearer';
	}

	public async startSignIn(_?: UnknownRecord): Promise<SignInAttempt> {
		await delay(2_000);
		return {
			attemptId: randomString(10),
			attemptExpiredAt: Date.now() + 1000 * 60 * 5,
			nextStep: 'password',
		};
	}

	public async continueSignIn(params?: SignInContinueParams): Promise<SignInContinueResult> {
		await delay(2_000);
		return {
			done: true,
			data: {
				accessToken: randomString(10),
				accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
				refreshToken: randomString(10),
				refreshTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
			},
		};
	}

	public async refreshSession(refreshToken: string): Promise<AuthenticatedSession> {
		await delay(2_000);
		return {
			accessToken: randomString(10),
			accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
			refreshToken: randomString(10),
			refreshTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
		};
	}

	public onAuthenticated(callback: AuthenticatedCallback): void {
		callback({
			accessToken: randomString(10),
			accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
		} as AuthenticatedSession);
	}
}
