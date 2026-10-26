import express, { type ErrorRequestHandler, type RequestHandler, type Response } from 'express';

import { createBootstrapService } from './bootstrap_service';
import { createSigninService } from './signin_service';
import {
	buildErrors, ERR_MALFORMED_REQUEST, sendErrors, sendUpstreamUnavailable, UpstreamUnavailableError,
} from '../../common/http/errors';

import type { BootstrapService } from './bootstrap_service';
import type { IamResult } from './iam_result';
import type { SigninService } from './signin_service';
import type { SessionCookies } from '../../common/session/cookies';
import type { ModuleRouter, ModuleRouterFactory } from '../index';


export const IAM_BASE_PATH = '/api/v1/iam';
export { ERR_MALFORMED_REQUEST };

export interface IamRouterDeps {
	readonly signin: SigninService;
	readonly bootstrap: BootstrapService;
	readonly sessionCookies: SessionCookies;
}

export const iamRouterFactory: ModuleRouterFactory = (container) => createIamRouter({
	signin: createSigninService({ upstream: container.upstream }),
	bootstrap: createBootstrapService({ upstream: container.upstream }),
	sessionCookies: container.sessionCookies,
});

/** Only these four paths are handled here; every other `/api/v1/iam/**` path falls through to the proxy. */
export function createIamRouter(deps: IamRouterDeps): ModuleRouter {
	const { signin, bootstrap, sessionCookies } = deps;
	const router = express.Router();
	const json = express.json();
	router.post('/signin/continue', json, handle(deps, (req) => signin.continueSignin(req, req.body)));
	router.post('/signin/refresh', handle(deps, (req) => signin.refresh(req, sessionCookies.readRefreshToken(req))));
	router.post('/signin/signout', handle(deps, async () => ({ status: 204, session: 'clear' })));
	router.get('/me/bootstrap', handle(deps, (req) => bootstrap.load(req, sessionCookies.readAccessToken(req))));
	router.use(malformedBodyHandler);
	return { basePath: IAM_BASE_PATH, router };
}

function handle(
	deps: IamRouterDeps, run: (req: express.Request) => Promise<IamResult>,
): RequestHandler {
	return async (req, res, next) => {
		res.setHeader('cache-control', 'no-store');
		try {
			sendResult(res, deps.sessionCookies, await run(req));
		}
		catch (err) {
			if (err instanceof UpstreamUnavailableError) {
				sendUpstreamUnavailable(res);
				return;
			}
			next(err);
		}
	};
}

function sendResult(res: Response, sessionCookies: SessionCookies, result: IamResult): void {
	if (result.session === 'clear') {
		sessionCookies.clear(res);
	}
	else if (result.session) {
		sessionCookies.setTokens(res, result.session);
	}
	res.status(result.status);
	if (result.body === undefined) {
		res.end();
	}
	else if (typeof result.body === 'string') {
		res.type(result.contentType ?? 'text/plain').send(result.body);
	}
	else {
		res.json(result.body);
	}
}

type BodyParserError = { type?: unknown; status?: number; expose?: boolean };

// express.json() failures (bad JSON, too large, bad charset) carry a client status; answer them as an error array.
const malformedBodyHandler: ErrorRequestHandler = (err: BodyParserError, _req, res, next) => {
	const status = err?.status ?? 500;
	if (typeof err?.type !== 'string' || !err.expose || status < 400 || status >= 500) {
		next(err);
		return;
	}
	res.setHeader('cache-control', 'no-store');
	sendErrors(res, status, buildErrors('validation', ERR_MALFORMED_REQUEST, 'The request body could not be read'));
};
