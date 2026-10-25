import { isSuccess, upstreamResult } from './iam_result';

import type { IamResult } from './iam_result';
import type { UpstreamClient, UpstreamJsonResponse } from '../../common/http/upstream_client';
import type { IncomingMessage } from 'node:http';


export const BOOTSTRAP_UPSTREAM_PATHS = {
	context: '/v1/iam/me/context',
	languages: '/v1/essential/essential_language/enabled',
	modules: '/v1/essential/essential_module_metadata?fields=*&page=0&size=500',
} as const;

export interface BootstrapService {
	/** Everything the shell needs after signin, in one round trip: `{context, languages, modules}`. */
	load(req: IncomingMessage, accessToken: string | undefined): Promise<IamResult>;
}

export interface BootstrapServiceDeps {
	readonly upstream: UpstreamClient;
}

export function createBootstrapService(deps: BootstrapServiceDeps): BootstrapService {
	return {
		load: (req, accessToken) => load(deps, req, accessToken),
	};
}

async function load(deps: BootstrapServiceDeps, req: IncomingMessage, accessToken: string | undefined) {
	const options = { accessToken, incomingReq: req };
	const responses = await Promise.all([
		deps.upstream.requestJson('GET', BOOTSTRAP_UPSTREAM_PATHS.context, options),
		deps.upstream.requestJson('GET', BOOTSTRAP_UPSTREAM_PATHS.languages, options),
		deps.upstream.requestJson<{ items?: unknown[] }>('GET', BOOTSTRAP_UPSTREAM_PATHS.modules, options),
	]);
	const failed = responses.find((response) => !isSuccess(response.status));
	if (failed) {
		return passThrough(failed);
	}
	const [context, languages, modules] = responses;
	return {
		status: 200,
		body: { context: context.body, languages: languages.body, modules: modules.body?.items ?? [] },
	} satisfies IamResult;
}

function passThrough(response: UpstreamJsonResponse<unknown>): IamResult {
	return upstreamResult(response.status, response.body, response.headers['content-type']);
}
