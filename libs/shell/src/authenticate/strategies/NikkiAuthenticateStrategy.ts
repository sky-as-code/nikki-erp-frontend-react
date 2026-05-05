import * as api from '@nikkierp/common/request';

import * as t from '../types';


/**
 * This strategy invokes NikkiERP Authenticate Module.
 */
export class NikkiAuthenticateStrategy implements t.ISignInStrategy {
	public get tokenType(): string {
		return 'Bearer';
	}

	public async startSignIn(params: t.StartSignInParams): Promise<t.StartSignInResult> {
		const request: StartSignInApiRequest = {
			principal_type: params.principalType,
			username: params.username,
		};
		const response = await api.post<StartSignInApiResponse>('v1/authn/signin/start', { json: request, noAuth: true });
		return {
			attemptId: response.attempt_id,
			createdAt: response.created_at,
			currentMethod: response.current_method,
			expiresAt: response.expires_at,
			methods: response.methods,
			principalName: response.principal_name,
		};
	}

	public async continueSignIn(params: t.SignInParams): Promise<t.SignInResult> {
		const request: SignInApiRequest = {
			attempt_id: params.attemptId,
			passwords: params.passwords,
		};
		const response = await api.post<SignInApiResponse>('v1/authn/signin/continue', {
			json: request,
			noAuth: true,
		});
		return {
			done: response.done,
			data: response.data ? {
				accessToken: response.data.access_token,
				accessTokenExpiresAt: response.data.access_token_expires_at,
				refreshToken: response.data.refresh_token,
				refreshTokenExpiresAt: response.data.refresh_token_expires_at,
			} : undefined,
			nextStep: response.next_step,
		};
	}

	public async refreshSession(params: t.RefreshTokenParams): Promise<t.AuthenticatedSession> {
		const request: RefreshSessionApiRequest = {
			refresh_token: params.refreshToken,
		};
		const response = await api.post<RefreshSessionApiResponse>('v1/authn/signin/refresh', {
			json: request,
			noAuth: true,
		});
		return {
			accessToken: response.access_token,
			accessTokenExpiresAt: response.access_token_expires_at,
			refreshToken: response.refresh_token,
			refreshTokenExpiresAt: response.refresh_token_expires_at,
		};
	}

	// public onAuthenticated(callback: AuthenticatedCallback): void {
	// 	callback({
	// 		accessToken: randomString(10),
	// 		accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
	// 	} as AuthenticatedSession);
	// }

	public async signOut(): Promise<void> {
		const response = await api.post<void>('v1/authn/signout');
		return response;
	}
}

type StartSignInApiRequest = {
	principal_type?: string,
	username: string,
};

type StartSignInApiResponse = {
	attempt_id: string,
	created_at: string,
	current_method: string,
	expires_at: string,
	methods: string[],
	principal_name: string,
};

type SignInApiRequest = {
	attempt_id: string,
	passwords: Record<string, unknown>,
};

type SignInApiResponse = {
	done: boolean,
	data?: RefreshSessionApiResponse,
	next_step?: string,
};

type RefreshSessionApiRequest = {
	refresh_token: string,
};

type RefreshSessionApiResponse = {
	access_token: string,
	access_token_expires_at: string,
	refresh_token?: string,
	refresh_token_expires_at?: string,
};