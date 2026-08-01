import { RequestMaker } from '@nikkierp/common/request';


/**
 * Direct REST access for the handful of IAM endpoints that `RestApi` does not model: nested
 * reads such as `GET /users/:id/roles` and the non-paged `GET /roles/describe`. Everything
 * that is a plain CRUD call on a registered schema must keep going through
 * `dyn.withSchema(...).restApi` so the schema-etag refresh still happens.
 */
export function apiGet<TResponse>(path: string, params?: Record<string, unknown>): Promise<TResponse> {
	const searchParams = toSearchParams(params);
	return RequestMaker.default().get<TResponse>(path, {
		searchParams,
		dedupKey: `GET/${path}?${searchParams.toString()}`,
	});
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
