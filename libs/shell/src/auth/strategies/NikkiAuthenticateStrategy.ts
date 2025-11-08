import { delay } from '@nikkierp/common/utils';

import { AuthenticatedCallback, ISignInStrategy, SignInResult } from '../types';


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

	public async start(_?: UnknownRecord): Promise<SignInAttempt> {
		await delay(2_000);
		return {
			attemptId: randomString(10),
			attemptExpiredAt: Date.now() + 1000 * 60 * 5,
			nextStep: 'password',
		};
	}

	public async continue(params?: SignInContinueParams): Promise<SignInContinueResult> {
		await delay(2_000);
		return {
			done: true,
			data: {
				accessToken: randomString(10),
				accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
			},
		};
	}

	public onAuthenticated(callback: AuthenticatedCallback): void {
		callback({
			accessToken: randomString(10),
			accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
		});
	}

	public getAccessToken(): string {
		throw new Error('Method not implemented.');
	}
}

function randomString(length: number): string {
	return Math.random().toString(36).substring(2, 2 + length);
}