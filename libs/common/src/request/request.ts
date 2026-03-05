
import kyLib from 'ky';

import type { KyInstance, Input, Options, KyRequest } from 'ky';


export type { Input, Options } from 'ky';

let api: KyInstance | null = null;


export type RequestMakerOts = {
	baseUrl: string,
	auth?: {
		tokenType?: string,
		getAccessToken: () => string | null,
		restoreAuthSession: () => Promise<boolean>,
		clearAuthSession: () => void,
	},
};

let isRetried = false;

function interceptorResponse(opts: RequestMakerOts) {
	const { tokenType = 'Bearer', getAccessToken, restoreAuthSession, clearAuthSession} = opts.auth || {};

	return async (request: KyRequest, options: Options, response: Response) => {
		if (!getAccessToken || !restoreAuthSession || response.status !== 401 || isRetried ) {
			isRetried = false;
			return response;
		}

		try {
			const restored = await restoreAuthSession();
			isRetried = true;
			if (!restored) {
				throw new Error('Refresh token unavailable');
			}

			const token = getAccessToken();
			if (!token) {
				throw new Error('Access token unavailable after refresh');
			}

			request.headers.set('Authorization', `${tokenType} ${token}`);
			return api!(request, options);
		}
		catch {
			isRetried = false;
			clearAuthSession?.();
			return response;
		}
	};
}

export function initRequestMaker(opts: RequestMakerOts) {
	if (api) return;

	const { tokenType = 'Bearer', getAccessToken } = opts.auth || {};

	api = kyLib.create({
		prefixUrl: opts.baseUrl,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		// use a hook to add the authorization header before each request
		hooks: {
			beforeRequest: [
				(request: KyRequest) => {
					if (getAccessToken) {
						const token = getAccessToken();
						request.headers.set('Authorization', `${tokenType} ${token}`);
					}
				},
			],
			afterResponse: [interceptorResponse(opts)],
		},
	});
}

export function ky(): KyInstance | null {
	return api;
}

export async function get<T>(url: Input, options?: Options): Promise<T> {
	const data = await send<T>('get', url, options);
	return data;
}

export async function post<T>(url: Input, options?: Options): Promise<T> {
	const data = await send<T>('post', url, options);
	return data;
}

export async function put<T>(url: Input, options?: Options): Promise<T> {
	const data = await send<T>('put', url, options);
	return data;
}

export async function patch<T>(url: Input, options?: Options): Promise<T> {
	const data = await send<T>('patch', url, options);
	return data;
}

export async function del<T>(url: Input, options?: Options): Promise<T> {
	const data = await send<T>('delete', url, options);
	return data;
}

export async function head<T>(url: Input, options?: Options): Promise<T> {
	const data = await send<T>('head', url, options);
	return data;
}

type KyFn = KyInstance['get'];

async function send<T>(method: keyof KyInstance, url: Input, options?: Options): Promise<T> {
	if (!api) throw new Error('Must call initRequestMaker() before sending requests');

	try {
		const fn = (api as any)[method] as KyFn;
		const data = await fn.call(api, url, options).json<T>();
		return data;
	}
	catch (error) {
		console.log(error);
		throw new Error('Failed to send request to server');
	}
}
