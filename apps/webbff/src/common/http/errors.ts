import type { ServerResponse } from 'node:http';


export type BackendErrorType = 'authorization' | 'business' | 'validation';

/** One item of the business service's error array response. */
export interface BackendError {
	type: BackendErrorType;
	key: string;
	message: string;
	field?: string;
	vars?: Record<string, unknown>;
}

export const ERR_UPSTREAM_UNAVAILABLE = 'common:err_upstream_unavailable';
export const ERR_NOT_FOUND = 'common:err_not_found';
export const ERR_MALFORMED_REQUEST = 'common:err_malformed_request';

export class UpstreamUnavailableError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'UpstreamUnavailableError';
	}
}

export function buildErrors(type: BackendErrorType, key: string, message: string): BackendError[] {
	return [{ type, key, message }];
}

export function sendErrors(res: ServerResponse, status: number, errors: BackendError[]): void {
	const body = JSON.stringify(errors);
	res.writeHead(status, {
		'content-type': 'application/json; charset=utf-8',
		'content-length': Buffer.byteLength(body),
	});
	res.end(body);
}

export function sendUpstreamUnavailable(res: ServerResponse): void {
	sendErrors(res, 502, buildErrors('business', ERR_UPSTREAM_UNAVAILABLE, 'The business service is unavailable'));
}

export function sendNotFound(res: ServerResponse): void {
	sendErrors(res, 404, buildErrors('business', ERR_NOT_FOUND, 'The desired data could not be found'));
}
