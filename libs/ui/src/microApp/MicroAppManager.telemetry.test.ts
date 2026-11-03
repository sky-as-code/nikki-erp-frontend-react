import { DEFAULT_TELEMETRY_CONFIG, initTelemetry, shutdownTelemetry } from '@nikkierp/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MicroAppManager } from './MicroAppManager';

import type { RegisterReducerFn } from './MicroAppStateProvider';
import type { MicroAppMetadata } from './types';
import type { TelemetryConfig } from '@nikkierp/common';


/** ID-AC-02 / AC-12: the config fetch's retries are one logical request with one ID, a span per attempt. */

type EndedSpan = {
	name: string,
	spanContext: () => { traceId: string, spanId: string },
	parentSpanContext?: { spanId: string },
};

const API_ORIGIN = 'https://example.test';
let ended: EndedSpan[];
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
	await shutdownTelemetry();
	ended = [];
	const processor = {
		onStart: () => undefined,
		onEnd: (span: EndedSpan) => ended.push(span),
		forceFlush: async () => undefined,
		shutdown: async () => undefined,
	};
	initTelemetry({
		...DEFAULT_TELEMETRY_CONFIG,
		propagationOrigins: [`${API_ORIGIN}/api`],
		spanProcessors: [processor] as unknown as TelemetryConfig['spanProcessors'],
	});
	fetchMock = vi.fn()
		.mockResolvedValueOnce(new Response('', { status: 503, statusText: 'Unavailable' }))
		.mockRejectedValueOnce(new TypeError('network down'))
		.mockResolvedValue(new Response('{"theme":"dark"}', { status: 200 }));
	vi.stubGlobal('fetch', fetchMock);
	vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(async () => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	await shutdownTelemetry();
});

function fetchConfigOf(configUrl: string): Promise<unknown> {
	const manager = new MicroAppManager([], {
		registerReducerFactory: () => (() => undefined) as unknown as RegisterReducerFn,
		retry: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 1 },
	});
	const app = { slug: 'demo', basePath: 'demo', bundleUrl: () => Promise.resolve({}), configUrl } as MicroAppMetadata;
	return (manager as unknown as { fetchConfig: (it: MicroAppMetadata) => Promise<unknown> }).fetchConfig(app);
}

function sentHeaders(): Headers[] {
	return fetchMock.mock.calls.map(call => (call[1] as RequestInit).headers as Headers);
}

describe('MicroAppManager config fetch telemetry', () => {
	it('keeps one idempotency ID across retries and opens one span per attempt in one trace', async () => {
		expect(await fetchConfigOf(`${API_ORIGIN}/api/demo/config.json`)).toEqual({ theme: 'dark' });

		const ids = sentHeaders().map(headers => headers.get('X-Idempotency-ID'));
		expect(ids).toHaveLength(3);
		expect(new Set(ids).size).toBe(1);
		expect(ids[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		expect(ended).toHaveLength(3);
		expect(new Set(ended.map(span => span.spanContext().traceId)).size).toBe(1);
		expect(new Set(ended.map(span => span.spanContext().spanId)).size).toBe(3);
		const parents = sentHeaders().map(headers => headers.get('traceparent')?.split('-')[2]);
		expect(parents).toEqual(ended.map(span => span.spanContext().spanId));
	});

	it('mints a new ID for a new logical request', async () => {
		await fetchConfigOf(`${API_ORIGIN}/api/demo/config.json`);
		fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
		await fetchConfigOf(`${API_ORIGIN}/api/demo/config.json`);

		const ids = sentHeaders().map(headers => headers.get('X-Idempotency-ID'));
		expect(new Set(ids).size).toBe(2);
	});

	it('traces but sends no trace or ID headers to a target outside the propagation allowlist', async () => {
		await fetchConfigOf('https://cdn.example.org/demo/config.json');

		for (const headers of sentHeaders()) {
			expect(headers.get('traceparent')).toBeNull();
			expect(headers.get('X-Idempotency-ID')).toBeNull();
			expect(headers.get('Content-Type')).toBe('application/json');
		}
		expect(ended).toHaveLength(3);
	});
});
