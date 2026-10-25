import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PERMISSION_DENIED_TOPIC, SESSION_AUTHORIZATION_ERROR_TOPIC } from './authorizationEvents';
import { RequestMaker } from './request';
import { EventBus } from '../eventBus';


const REFUSAL = [{
	key: 'common:err_insufficient_permissions',
	message: 'Insufficient permissions',
	type: 'authorization',
	vars: { entitlements: ['View:ReportRevenue:org/ORG1'] },
}];

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function newRequestMaker(): RequestMaker {
	return new RequestMaker({ baseUrl: 'https://example.test', ensureSession: async () => true });
}

/**
 * The request layer announces refusals for every call, not only for typed services: a report
 * export goes through the raw `ky()` client and never sees a `ServiceResult`.
 */
describe('refusal announcement', () => {
	let fetchMock: ReturnType<typeof vi.fn>;
	let published: Array<{ topic: string, payload: any }>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		published = [];
		EventBus.instance = {
			publish: (topic: string, payload: unknown) => published.push({ topic, payload }),
		} as never;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		EventBus.instance = undefined;
	});

	it('publishes permission denied with the entitlements on a 403 through the typed path', async () => {
		fetchMock.mockResolvedValue(jsonResponse(403, REFUSAL));

		const result = await newRequestMaker().post<unknown>('v1/things');

		expect(result.clientErrors).toHaveLength(1);
		expect(published).toEqual([{
			topic: PERMISSION_DENIED_TOPIC,
			payload: expect.objectContaining({ entitlements: ['View:ReportRevenue:org/ORG1'] }),
		}]);
	});

	it('publishes on a 403 from a raw ky download too', async () => {
		fetchMock.mockResolvedValue(jsonResponse(403, REFUSAL));

		await expect(newRequestMaker().ky().get('v1/report/export').blob()).rejects.toThrow();

		expect(published.map(p => p.topic)).toEqual([PERMISSION_DENIED_TOPIC]);
	});

	it('routes an unauthenticated 401 to the session topic', async () => {
		fetchMock.mockResolvedValue(jsonResponse(401, [{
			key: 'common:err_unauthenticated', message: 'Sign in', type: 'authorization',
		}]));

		await newRequestMaker().get<unknown>('v1/things');

		expect(published.map(p => p.topic)).toEqual([SESSION_AUTHORIZATION_ERROR_TOPIC]);
	});

	it('announces nothing for a validation failure', async () => {
		fetchMock.mockResolvedValue(jsonResponse(400, [{ key: 'x', message: 'bad', type: 'validation' }]));

		await newRequestMaker().post<unknown>('v1/things');

		expect(published).toEqual([]);
	});
});
