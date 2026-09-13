import { RequestMaker } from '@nikkierp/common/request';

import type { RequestResult } from '@nikkierp/common/request';


/**
 * Direct REST access for the inbox endpoints.
 *
 * They are not dynamic-model CRUD and have no registered schema: none is addressed by a record id,
 * and the server decides whose notifications they answer from the request context. Anything that
 * IS a plain CRUD call on a registered schema must keep going through `dyn.withSchema(...).restApi`
 * so the schema-etag refresh still happens.
 */
export function apiGet<TResponse>(
	path: string, params?: Record<string, unknown>,
): Promise<RequestResult<TResponse>> {
	const searchParams = toSearchParams(params);
	return RequestMaker.default().get<TResponse>(path, {
		searchParams,
		dedupKey: `GET/${path}?${searchParams.toString()}`,
	});
}

export function apiPost<TResponse>(
	path: string, body?: unknown,
): Promise<RequestResult<TResponse>> {
	return RequestMaker.default().post<TResponse>(path, { json: body ?? {} });
}

/**
 * Mirrors how `RestApi` serialises a request: arrays become one repeated param per element
 * (which is how the backend binds `[]string` and `[]model.Id`), objects are JSON-encoded, and
 * nullish values are dropped.
 */
export function toSearchParams(params?: Record<string, unknown>): URLSearchParams {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params ?? {})) {
		if (value == null) {
			continue;
		}
		if (Array.isArray(value)) {
			value.forEach(item => searchParams.append(key, String(item)));
		}
		else if (typeof value === 'object') {
			searchParams.append(key, JSON.stringify(value));
		}
		else {
			searchParams.append(key, String(value));
		}
	}
	return searchParams;
}
