import * as api from '@nikkierp/common/request';

import * as t from '../types';


/**
 * This strategy invokes NikkiERP Authenticate Module.
 */
export class NikkiAuthenticateStrategy implements t.ISignInStrategy {
	public async startSignIn(params: t.StartSignInParams): Promise<t.StartSignInResult> {
		const request: StartSignInApiRequest = {
			principal_type: params.principalType,
			username: params.username,
		};
		const response = api.unwrapResult(
			await api.post<StartSignInApiResponse>('v1/iam/signin/start', { json: request, noAuth: true }),
		);
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
		const response = api.unwrapResult(await api.post<SignInApiResponse>('v1/iam/signin/continue', {
			json: request,
			noAuth: true,
		}));
		return {
			done: response.done,
			data: response.data ? toSession(response.data) : undefined,
			nextStep: response.next_step,
		};
	}

	/** The BFF reads the refresh cookie, rotates both cookies and answers with their new expiries. */
	public async refreshSession(): Promise<t.AuthenticatedSession> {
		const response = api.unwrapResult(
			await api.post<SessionExpiryApiResponse>('v1/iam/signin/refresh', { noAuth: true }),
		);
		return toSession(response);
	}

	/** Clears both cookies. The tokens are stateless JWTs nothing could revoke, so that is all it can do. */
	public async signOut(): Promise<void> {
		api.unwrapResult(await api.post<void>('v1/iam/signin/signout', { noAuth: true }));
	}
}

function toSession(response: SessionExpiryApiResponse): t.AuthenticatedSession {
	return {
		accessTokenExpiresAt: response.access_token_expires_at,
		refreshTokenExpiresAt: response.refresh_token_expires_at,
	};
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
	data?: SessionExpiryApiResponse,
	next_step?: string,
};

type SessionExpiryApiResponse = {
	access_token_expires_at: string,
	refresh_token_expires_at: string,
};
