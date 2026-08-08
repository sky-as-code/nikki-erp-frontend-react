import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestMaker, unwrapResult } from './request';
import { ClientErrors } from '../types/common';


/** One `ClientErrorItem` as the backend serialises it: a bare top-level array. */
const CLIENT_ERROR_BODY = [
	{ field: 'email', key: 'iam.err_duplicate_email', message: 'Email already taken', type: 'validation' },
];

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function newRequestMaker(): RequestMaker {
	return new RequestMaker({
		baseUrl: 'https://example.test',
		auth: { getToken: async () => 'token' },
	});
}

describe('RequestMaker._send response handling', () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns parsed data with no client errors on 2xx', async () => {
		fetchMock.mockResolvedValue(jsonResponse(200, { id: '1' }));

		const result = await newRequestMaker().get<{ id: string }>('v1/things');

		expect(result).toEqual({ data: { id: '1' }, clientErrors: [] });
	});

	it('maps a 4xx ClientErrors array onto `clientErrors`, not a throw', async () => {
		fetchMock.mockResolvedValue(jsonResponse(400, CLIENT_ERROR_BODY));

		const result = await newRequestMaker().post<unknown>('v1/things');

		expect(result.data).toBeNull();
		expect(result.clientErrors).toHaveLength(1);
		expect(result.clientErrors[0].field).toBe('email');
		expect(result.clientErrors[0].key).toBe('iam.err_duplicate_email');
		expect(result.clientErrors[0].name).toBe('validation');
	});

	it('maps a 401 authorization error onto `clientErrors` (the backend uses 4xx for denial)', async () => {
		fetchMock.mockResolvedValue(jsonResponse(401, [
			{ key: 'authorize.err_invalid_access_token', message: 'Invalid token', type: 'authorization' },
		]));

		const result = await newRequestMaker().get<unknown>('v1/things');

		expect(result.clientErrors[0].name).toBe('authorization');
	});

	it('throws when a 4xx body is not a ClientErrors array', async () => {
		fetchMock.mockResolvedValue(jsonResponse(400, { message: 'unexpected shape' }));

		await expect(newRequestMaker().get('v1/things')).rejects.toThrow(/unrecognized error format/i);
	});

	it('throws on 5xx rather than returning client errors', async () => {
		fetchMock.mockResolvedValue(jsonResponse(500, { message: 'internal' }));

		const promise = newRequestMaker().get('v1/things');

		await expect(promise).rejects.toThrow(/500/);
	});

	it('throws on a network failure', async () => {
		fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(newRequestMaker().get('v1/things')).rejects.toThrow(/Failed to fetch/);
	});

	it('throws on an HTML error page rather than silently returning null', async () => {
		fetchMock.mockResolvedValue(new Response('<html>Gateway Timeout</html>', {
			status: 504,
			headers: { 'Content-Type': 'text/html' },
		}));

		await expect(newRequestMaker().get('v1/things')).rejects.toThrow(/504/);
	});

	it('does not retry a 5xx — one request, one failure', async () => {
		fetchMock.mockResolvedValue(jsonResponse(500, { message: 'internal' }));

		await expect(newRequestMaker().get('v1/things')).rejects.toThrow();

		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it('collapses concurrent requests sharing a dedupKey into one call', async () => {
		fetchMock.mockResolvedValue(jsonResponse(200, { id: '1' }));
		const requestMaker = newRequestMaker();

		const [first, second] = await Promise.all([
			requestMaker.get<{ id: string }>('v1/things', { dedupKey: 'same' }),
			requestMaker.get<{ id: string }>('v1/things', { dedupKey: 'same' }),
		]);

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(first).toEqual(second);
	});
});

describe('unwrapResult', () => {
	it('returns data when there are no client errors', () => {
		expect(unwrapResult({ data: { id: '1' }, clientErrors: [] })).toEqual({ id: '1' });
	});

	it('throws ClientErrors when the server rejected the call', () => {
		const result = { data: null, clientErrors: ClientErrors.from(CLIENT_ERROR_BODY).items };

		expect(() => unwrapResult(result)).toThrow(ClientErrors);
	});
});
