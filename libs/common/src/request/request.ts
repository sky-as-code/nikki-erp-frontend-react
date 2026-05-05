
import kyLib, { HTTPError } from 'ky';

import { ClientErrors } from '../types/common';

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

type KyFn = KyInstance['get'];

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

	private isRetried = false;

	public constructor(opts: RequestMakerOts) {
		if (this.#api) return;

		const { tokenType = 'Bearer', getToken } = opts.auth || {};

		this.#api = kyLib.create({
			prefixUrl: opts.baseUrl,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
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

	public get<T>(url: Input, options?: RequestOptions): Promise<T> {
		return this._send<T>('get', url, options);
	}

	public post<T>(url: Input, options?: RequestOptions): Promise<T> {
		return this._send<T>('post', url, options);
	}

	public put<T>(url: Input, options?: RequestOptions): Promise<T> {
		return this._send<T>('put', url, options);
	}

	public patch<T>(url: Input, options?: RequestOptions): Promise<T> {
		return this._send<T>('patch', url, options);
	}

	public delete<T>(url: Input, options?: RequestOptions): Promise<T> {
		return this._send<T>('delete', url, options);
	}

	public head<T>(url: Input, options?: RequestOptions): Promise<T> {
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

	private async _send<T>(method: keyof KyInstance, url: Input, options?: RequestOptions): Promise<T> {
		if (!this.#api) throw new Error('Must call initRequestMaker() before sending requests');

		try {
			const fn = (this.#api as any)[method] as KyFn;
			const promise = fn.call(this.#api, url, options).json<T>();
			const dedupKey = options?.dedupKey;
			if (dedupKey) {
				if (this.#dedupMap.has(dedupKey)) {
					// Must have "await" to throw and catch errors
					return await this.#dedupMap.get(dedupKey)!;
				}
				this.#dedupMap.set(dedupKey, promise);
				promise.finally(() => {
					this.#dedupMap.delete(dedupKey);
				});
			}
			// Must have "await" to throw and catch errors
			return await promise;
		}
		catch (error) {
			if (error instanceof HTTPError) {
				const response = error.response;
				let data: any = null;

				try {
					data = await response.json();
					if (ClientErrors.canConvert(data)) {
						throw ClientErrors.from(data);
					}
				}
				catch {
					data = await response.text();
					throw new Error('Server responded with unrecognized error format: ' + data);
				}
			}
			else if (error instanceof Error) {
				throw error;
			}

			throw new Error('Failed to send request to server: ' + String(error));
		}
	}
}

export function ky(): KyInstance | null {
	return RequestMaker.default().ky();
}

export async function get<T>(url: Input, options?: RequestOptions): Promise<T> {
	return RequestMaker.default().get<T>(url, options);
}

export async function post<T>(url: Input, options?: RequestOptions): Promise<T> {
	return RequestMaker.default().post<T>(url, options);
}

export async function put<T>(url: Input, options?: RequestOptions): Promise<T> {
	return RequestMaker.default().put<T>(url, options);
}

export async function patch<T>(url: Input, options?: RequestOptions): Promise<T> {
	return RequestMaker.default().patch<T>(url, options);
}

export async function del<T>(url: Input, options?: RequestOptions): Promise<T> {
	return RequestMaker.default().delete<T>(url, options);
}

export async function head<T>(url: Input, options?: RequestOptions): Promise<T> {
	return RequestMaker.default().head<T>(url, options);
}
