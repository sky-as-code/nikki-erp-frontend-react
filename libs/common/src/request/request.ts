
import kyLib, { HTTPError } from 'ky';

import type { KyInstance, Input, Options, KyRequest } from 'ky';


export type { Input, Options } from 'ky';


export type RequestMakerOts = {
	baseUrl: string,
	auth?: {
		tokenType?: string,
		getToken: () => string | null,
		restoreSession: () => Promise<boolean>,
		clearSession: () => void,
	},
};

type KyFn = KyInstance['get'];

export class RequestMaker {
	public static default: RequestMaker = new RequestMaker();

	public static initDefault(opts: RequestMakerOts): void {
		RequestMaker.default.init(opts);
	}

	private api: KyInstance | null = null;

	private isRetried = false;

	public init(opts: RequestMakerOts): void {
		if (this.api) return;

		const { tokenType = 'Bearer', getToken } = opts.auth || {};

		this.api = kyLib.create({
			prefixUrl: opts.baseUrl,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			hooks: {
				beforeRequest: [
					(request: KyRequest) => {
						if (getToken) {
							const token = getToken();
							request.headers.set('Authorization', `${tokenType} ${token}`);
						}
						if (request.body instanceof FormData && !request.headers.get('Content-Type')) {
							request.headers.set('Content-Type', 'multipart/form-data');
						}
					},
				],
				afterResponse: [this._refreshTokenInterceptor(opts)],
			},
		});
	}

	public ky(): KyInstance {
		if (!this.api) throw new Error('Must call init() before use');
		return this.api;
	}

	public get<T>(url: Input, options?: Options): Promise<T> {
		return this._send<T>('get', url, options);
	}

	public post<T>(url: Input, options?: Options): Promise<T> {
		return this._send<T>('post', url, options);
	}

	public put<T>(url: Input, options?: Options): Promise<T> {
		return this._send<T>('put', url, options);
	}

	public patch<T>(url: Input, options?: Options): Promise<T> {
		return this._send<T>('patch', url, options);
	}

	public delete<T>(url: Input, options?: Options): Promise<T> {
		return this._send<T>('delete', url, options);
	}

	public head<T>(url: Input, options?: Options): Promise<T> {
		return this._send<T>('head', url, options);
	}

	private _refreshTokenInterceptor(opts: RequestMakerOts) {
		const { tokenType = 'Bearer', getToken, restoreSession, clearSession } = opts.auth || {};

		return async (request: KyRequest, options: Options, response: Response) => {
			if (!getToken || !restoreSession || response.status !== 401 || this.isRetried) {
				this.isRetried = false;
				return response;
			}

			try {
				const restored = await restoreSession();
				this.isRetried = true;
				if (!restored) {
					throw new Error('Refresh token unavailable');
				}

				const token = getToken();
				if (!token) {
					throw new Error('Access token unavailable after refresh');
				}

				request.headers.set('Authorization', `${tokenType} ${token}`);
				return this.api!(request, options);
			}
			catch {
				this.isRetried = false;
				clearSession?.();
				return response;
			}
		};
	}

	private async _send<T>(method: keyof KyInstance, url: Input, options?: Options): Promise<T> {
		if (!this.api) throw new Error('Must call initRequestMaker() before sending requests');

		try {
			const fn = (this.api as any)[method] as KyFn;
			const data = await fn.call(this.api, url, options).json<T>();
			return data;
		}
		catch (error) {
			if (error instanceof HTTPError) {
				const response = error.response;
				let data: any = null;

				try {
					data = await response.json();
				}
				catch {
					data = await response.text();
				}

				if (typeof data === 'string') {
					throw new Error(data);
				}
				throw data;
			}

			throw new Error(error instanceof Error ? error.message : 'Failed to send request to server');
		}
	}
}

/** Default app-wide instance; existing module exports delegate here. */
export const requestMaker = new RequestMaker();

/**
 * @deprecated Use RequestMaker.initDefault() instead
 */
export function initRequestMaker(opts: RequestMakerOts) {
	requestMaker.init(opts);
}

export function ky(): KyInstance | null {
	return requestMaker.ky();
}

export async function get<T>(url: Input, options?: Options): Promise<T> {
	return requestMaker.get<T>(url, options);
}

export async function post<T>(url: Input, options?: Options): Promise<T> {
	return requestMaker.post<T>(url, options);
}

export async function put<T>(url: Input, options?: Options): Promise<T> {
	return requestMaker.put<T>(url, options);
}

export async function patch<T>(url: Input, options?: Options): Promise<T> {
	return requestMaker.patch<T>(url, options);
}

export async function del<T>(url: Input, options?: Options): Promise<T> {
	return requestMaker.delete<T>(url, options);
}

export async function head<T>(url: Input, options?: Options): Promise<T> {
	return requestMaker.head<T>(url, options);
}
