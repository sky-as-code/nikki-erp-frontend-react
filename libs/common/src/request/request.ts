
import kyLib, { HTTPError } from 'ky';

import { ClientErrorItem, ClientErrors } from '../types/common';

import type { KyInstance, Input, Options, KyRequest } from 'ky';


export type { Input, Options } from 'ky';


export type RequestMakerOts = {
	baseUrl: string,
	auth: {
		// Default is 'Bearer'.
		tokenType?: string,
		getToken: () => Promise<string>,
	},
};

export type RequestOptions = Options & {
	// If true, the request will not include the Authorization header
	noAuth?: boolean,
	dedupKey?: string,
};

/**
 * Outcome of an HTTP call, split along the line the backend draws.
 *
 * - `data` is the parsed 2xx body, or `null` when the server answered 4xx.
 * - `clientErrors` holds validation / business / authorization failures parsed from
 *   a 4xx body. Always an array; empty on success.
 *
 * Technical failures (5xx, network, unparseable body) are **thrown**, never returned.
 *
 * Identical in shape to a `ServiceResult`, deliberately: a service passes this
 * straight through without rewrapping. Declared here rather than imported so the
 * request layer keeps no dependency on the command bus.
 */
export type RequestResult<T> = {
	data: T | null,
	clientErrors: ClientErrorItem[],
};

type KyFn = KyInstance['get'];

/** 2xx outcome. */
function okResult<T>(data: T): RequestResult<T> {
	return { data, clientErrors: [] };
}

/** 4xx outcome. */
function clientErrorResult<T>(clientErrors: ClientErrorItem[]): RequestResult<T> {
	return { data: null, clientErrors };
}

/**
 * Unwraps a {@link RequestResult}, throwing {@link ClientErrors} when the server
 * rejected the call.
 *
 * For callers that genuinely want an exception rather than a branch — chiefly the
 * authentication flow, whose existing handlers already catch `ClientErrors`. Prefer
 * handling `clientErrors` directly in new code.
 */
export function unwrapResult<T>(result: RequestResult<T>): T {
	if (result.clientErrors.length > 0) {
		throw new ClientErrors(result.clientErrors);
	}
	return result.data as T;
}

export class RequestMaker {
	private static _default: RequestMaker = null!;

	public static default(): RequestMaker {
		if (!RequestMaker._default) {
			throw new Error('Must call initDefault() before use');
		}
		return RequestMaker._default;
	}

	public static initDefault(opts: RequestMakerOts): void {
		RequestMaker._default = new RequestMaker(opts);
	}

	#api: KyInstance | null = null;

	#dedupMap: Map<string, Promise<any>> = new Map();

	public constructor(opts: RequestMakerOts) {
		if (this.#api) return;

		const { tokenType = 'Bearer', getToken } = opts.auth || {};

		this.#api = kyLib.create({
			prefixUrl: opts.baseUrl,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			// Explicit: ky retries idempotent 5xx twice by default, tripling failure latency.
			// A technical failure surfaces immediately instead.
			retry: 0,
			hooks: {
				beforeRequest: [
					async (request: KyRequest, options: RequestOptions) => {
						if (!options.noAuth) {
							const token = await getToken();
							request.headers.set('Authorization', `${tokenType} ${token}`);
						}
						if (request.body instanceof FormData && !request.headers.get('Content-Type')) {
							request.headers.set('Content-Type', 'multipart/form-data');
						}
					},
				],
				// afterResponse: [this._refreshTokenInterceptor(opts)],
			},
		});
	}

	public ky(): KyInstance {
		if (!this.#api) throw new Error('Must call init() before use');
		return this.#api;
	}

	public get<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		return this._send<T>('get', url, options);
	}

	public post<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		return this._send<T>('post', url, options);
	}

	public put<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		return this._send<T>('put', url, options);
	}

	public patch<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		return this._send<T>('patch', url, options);
	}

	public delete<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		return this._send<T>('delete', url, options);
	}

	public head<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		return this._send<T>('head', url, options);
	}

	// private _refreshTokenInterceptor(opts: RequestMakerOts) {
	// 	const { tokenType = 'Bearer', getToken, restoreSession, clearSession } = opts.auth || {};

	// 	return async (request: KyRequest, options: Options, response: Response) => {
	// 		if (!getToken || !restoreSession || response.status !== 401 || this.isRetried) {
	// 			this.isRetried = false;
	// 			return response;
	// 		}

	// 		try {
	// 			const restored = await restoreSession();
	// 			this.isRetried = true;
	// 			if (!restored) {
	// 				throw new Error('Refresh token unavailable');
	// 			}

	// 			const token = getToken();
	// 			if (!token) {
	// 				throw new Error('Access token unavailable after refresh');
	// 			}

	// 			request.headers.set('Authorization', `${tokenType} ${token}`);
	// 			return this.api!(request, options);
	// 		}
	// 		catch {
	// 			this.isRetried = false;
	// 			clearSession?.();
	// 			return response;
	// 		}
	// 	};
	// }

	private async _send<T>(method: keyof KyInstance, url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
		if (!this.#api) throw new Error('Must call initRequestMaker() before sending requests');

		const dedupKey = options?.dedupKey;
		if (dedupKey) {
			const inflight = this.#dedupMap.get(dedupKey);
			// Must have "await" to throw and catch errors
			if (inflight) return await inflight;
		}

		const promise = this._sendOnce<T>(method, url, options);
		if (dedupKey) {
			this.#dedupMap.set(dedupKey, promise);
			promise.finally(() => {
				this.#dedupMap.delete(dedupKey);
			});
		}
		// Must have "await" to throw and catch errors
		return await promise;
	}

	private async _sendOnce<T>(
		method: keyof KyInstance, url: Input, options?: RequestOptions,
	): Promise<RequestResult<T>> {
		try {
			const fn = (this.#api as any)[method] as KyFn;
			return okResult(await fn.call(this.#api, url, options).json<T>());
		}
		catch (error) {
			if (error instanceof HTTPError) {
				return await this._toResult<T>(error.response);
			}
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to send request to server: ' + String(error));
		}
	}

	/**
	 * Splits a non-2xx response: a 4xx carrying the backend's `ClientErrors` array
	 * becomes `clientErrors`; everything else is a technical fault and is thrown.
	 */
	private async _toResult<T>(response: Response): Promise<RequestResult<T>> {
		const body = await this._readBody(response);
		if (response.status >= 400 && response.status < 500 && ClientErrors.canConvert(body)) {
			return clientErrorResult<T>(ClientErrors.from(body).items);
		}
		throw new Error(
			`Server responded with ${response.status} and an unrecognized error format: ${JSON.stringify(body)}`,
		);
	}

	/** Reads the body once, as JSON when possible and as text otherwise. */
	private async _readBody(response: Response): Promise<unknown> {
		const text = await response.text().catch(() => '');
		if (!text) return null;
		try {
			return JSON.parse(text);
		}
		catch {
			return text;
		}
	}
}

export function ky(): KyInstance | null {
	return RequestMaker.default().ky();
}

export async function get<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
	return RequestMaker.default().get<T>(url, options);
}

export async function post<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
	return RequestMaker.default().post<T>(url, options);
}

export async function put<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
	return RequestMaker.default().put<T>(url, options);
}

export async function patch<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
	return RequestMaker.default().patch<T>(url, options);
}

export async function del<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
	return RequestMaker.default().delete<T>(url, options);
}

export async function head<T>(url: Input, options?: RequestOptions): Promise<RequestResult<T>> {
	return RequestMaker.default().head<T>(url, options);
}
