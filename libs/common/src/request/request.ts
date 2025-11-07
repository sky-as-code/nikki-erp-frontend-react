
import kyLib from 'ky';

import type { KyInstance, Input, Options, KyRequest } from 'ky';


export type { Input, Options } from 'ky';

let api: KyInstance | null = null;


export type RequestMakerOts = {
	baseUrl: string,
	auth: {
		tokenType?: string,
		getToken: () => string,
	},
};

export function initRequestMaker(opts: RequestMakerOts) {
	if (api) return;

	const {
		tokenType = 'Bearer',
		getToken,
	} = opts.auth || {};
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
					if (opts.auth) {
						const token = getToken!();
						request.headers.set('Authorization', `${tokenType} ${token}`);
					}
				},
			],
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
