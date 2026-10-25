import { isSuccess, upstreamResult } from './iam_result';
import { buildErrors, ERR_UPSTREAM_UNAVAILABLE } from '../../common/http/errors';

import type { IamResult } from './iam_result';
import type { UpstreamClient, UpstreamJsonResponse } from '../../common/http/upstream_client';
import type { SessionTokens } from '../../common/session/cookies';
import type { IncomingMessage } from 'node:http';


export const ERR_UNAUTHENTICATED = 'common:err_unauthenticated';
const UPSTREAM_CONTINUE_PATH = '/v1/iam/signin/continue';
const UPSTREAM_REFRESH_PATH = '/v1/iam/signin/refresh';

interface UpstreamTokens {
	access_token: string;
	access_token_expires_at: string;
	refresh_token: string;
	refresh_token_expires_at: string;
}

interface ContinueResponse {
	done?: boolean;
	data?: Partial<UpstreamTokens>;
	[key: string]: unknown;
}

export interface SigninService {
	/** Forwards the step; on a finished signin, keeps the tokens for the cookies and only returns expiries. */
	continueSignin(req: IncomingMessage, body: unknown): Promise<IamResult>;
	/** Rotates the session from the refresh cookie; any refusal ends the session. */
	refresh(req: IncomingMessage, refreshToken: string | undefined): Promise<IamResult>;
}

export interface SigninServiceDeps {
	readonly upstream: UpstreamClient;
}

export function createSigninService(deps: SigninServiceDeps): SigninService {
	return {
		continueSignin: (req, body) => continueSignin(deps, req, body),
		refresh: (req, refreshToken) => refresh(deps, req, refreshToken),
	};
}

export function unauthenticated(): IamResult {
	return {
		status: 401,
		body: buildErrors('authorization', ERR_UNAUTHENTICATED, 'The session is missing or has expired'),
		session: 'clear',
	};
}

async function continueSignin(deps: SigninServiceDeps, req: IncomingMessage, body: unknown): Promise<IamResult> {
	const response = await deps.upstream.requestJson<ContinueResponse>(
		'POST', UPSTREAM_CONTINUE_PATH, { body: body ?? {}, incomingReq: req },
	);
	if (!isSuccess(response.status) || !response.body?.done || !response.body.data) {
		return passThrough(response);
	}
	const tokens = toSessionTokens(response.body.data);
	if (!tokens) {
		return malformedTokens();
	}
	return {
		status: response.status,
		body: { ...response.body, data: toExpiries(tokens) },
		session: tokens,
	};
}

async function refresh(
	deps: SigninServiceDeps, req: IncomingMessage, refreshToken: string | undefined,
): Promise<IamResult> {
	if (!refreshToken) {
		return { ...unauthenticated(), session: undefined };
	}
	const response = await deps.upstream.requestJson<Partial<UpstreamTokens>>(
		'POST', UPSTREAM_REFRESH_PATH, { body: { refresh_token: refreshToken }, incomingReq: req },
	);
	if (response.status >= 400 && response.status < 500) {
		return unauthenticated();
	}
	if (!isSuccess(response.status)) {
		return passThrough(response);
	}
	const tokens = toSessionTokens(response.body);
	if (!tokens) {
		return malformedTokens();
	}
	return { status: 200, body: toExpiries(tokens), session: tokens };
}

// Never pass an unexpected success body through: it may hold a token the browser must not see.
function malformedTokens(): IamResult {
	return {
		status: 502,
		body: buildErrors('business', ERR_UPSTREAM_UNAVAILABLE, 'The business service returned no session tokens'),
	};
}

function passThrough(response: UpstreamJsonResponse<unknown>): IamResult {
	const contentType = response.headers['content-type'];
	return upstreamResult(response.status, response.body, contentType);
}

function toSessionTokens(data: Partial<UpstreamTokens> | undefined): SessionTokens | undefined {
	if (!data?.access_token || !data.refresh_token || !data.access_token_expires_at || !data.refresh_token_expires_at) {
		return undefined;
	}
	return {
		accessToken: data.access_token,
		accessExpiresAt: data.access_token_expires_at,
		refreshToken: data.refresh_token,
		refreshExpiresAt: data.refresh_token_expires_at,
	};
}

function toExpiries(tokens: SessionTokens) {
	return {
		access_token_expires_at: tokens.accessExpiresAt,
		refresh_token_expires_at: tokens.refreshExpiresAt,
	};
}
