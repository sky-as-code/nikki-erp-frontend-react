import { DEFAULT_TELEMETRY_CONFIG, initTelemetry, shutdownTelemetry } from '@nikkierp/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationStream } from './stream';

import type { TelemetryConfig } from '@nikkierp/common';


/**
 * AC-23: a connection is one CLIENT span, ended exactly once when the stream ends, is refused or is closed,
 * with no span per chunk; every connect attempt is its own logical request (new ID, new root trace).
 */

type EndedSpan = {
	name: string,
	attributes: Record<string, unknown>,
	status: { code: number },
	parentSpanContext?: unknown,
	spanContext: () => { traceId: string },
};

const BASE_URL = 'https://example.test/api';
let ended: EndedSpan[];
let onSpanEnded: () => void;

beforeEach(async () => {
	await shutdownTelemetry();
	ended = [];
	onSpanEnded = () => undefined;
	const processor = {
		onStart: () => undefined,
		onEnd: (span: EndedSpan) => {
			ended.push(span);
			onSpanEnded();
		},
		forceFlush: async () => undefined,
		shutdown: async () => undefined,
	};
	initTelemetry({
		...DEFAULT_TELEMETRY_CONFIG,
		propagationOrigins: [BASE_URL],
		spanProcessors: [processor] as unknown as TelemetryConfig['spanProcessors'],
	});
});

afterEach(async () => {
	vi.unstubAllGlobals();
	await shutdownTelemetry();
});

function line(seq: number): string {
	return `${JSON.stringify({ seq, type: 'notification.created', data: { notification_id: `n-${seq}` } })}\n`;
}

/** A body that sends `chunks` and then stays open until the request is aborted, like a live stream. */
function liveBody(chunks: string[], signal: AbortSignal): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
			signal.addEventListener('abort', () => controller.error(new DOMException('aborted', 'AbortError')));
		},
	});
}

function endedBody(chunks: string[]): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
			controller.close();
		},
	});
}

function spanEnded(count: number): Promise<void> {
	return new Promise(resolve => {
		onSpanEnded = () => {
			if (ended.length >= count) resolve();
		};
	});
}

function sentHeaders(fetchMock: ReturnType<typeof vi.fn>): Headers[] {
	return fetchMock.mock.calls.map(call => (call[1] as RequestInit).headers as Headers);
}

function newStream(onNotification: () => void, onStatus?: (status: string) => void): NotificationStream {
	return new NotificationStream({ orgId: 'org-1', baseUrl: BASE_URL, ensureSession: () => true, onNotification, onStatus });
}

describe('NotificationStream telemetry', () => {
	it('ends the connection span once, after the whole body, with no span per chunk', async () => {
		const fetchMock = vi.fn(async () => ({ ok: true, status: 200, body: endedBody([line(1), line(2), line(3)]) }));
		vi.stubGlobal('fetch', fetchMock);
		let stream: NotificationStream;
		await new Promise<void>(resolve => {
			stream = newStream(() => undefined, status => {
				if (status === 'reconnecting') {
					stream.close();
					resolve();
				}
			});
			stream.start();
		});

		expect(ended).toHaveLength(1);
		expect(ended[0].name).toBe('GET');
		expect(ended[0].attributes['http.response.status_code']).toBe(200);
		expect(ended[0].status.code).toBe(0);
		expect(ended[0].parentSpanContext).toBeUndefined();
		const [headers] = sentHeaders(fetchMock);
		expect(headers.get('traceparent')?.split('-')[1]).toBe(ended[0].spanContext().traceId);
		expect(headers.get('X-Idempotency-ID')).toMatch(/^[0-9a-f-]{36}$/);
		expect(headers.get('Accept')).toBe('application/x-ndjson');
	});

	it('ends the connection span once, as cancelled and not failed, when the stream is closed mid-read', async () => {
		vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => (
			{ ok: true, status: 200, body: liveBody([line(1)], init.signal!) }
		)));
		const done = spanEnded(1);
		// From outside the read loop, so the pending read is the one the abort ends.
		const stream = newStream(() => setTimeout(() => stream.close(), 0));
		stream.start();
		await done;
		await new Promise(resolve => setTimeout(resolve, 10));

		expect(ended).toHaveLength(1);
		expect(ended[0].attributes['coremart.cancelled']).toBe(true);
		expect(ended[0].status.code).not.toBe(2);
	});

});

describe('NotificationStream telemetry across connect attempts', () => {
	it('gives each connect attempt a new ID and its own root trace', async () => {
		const fetchMock = vi.fn()
			.mockImplementationOnce(async () => ({ ok: false, status: 401, body: null }))
			.mockImplementation(async (_url: string, init: RequestInit) => (
				{ ok: true, status: 200, body: liveBody([line(1)], init.signal!) }
			));
		vi.stubGlobal('fetch', fetchMock);
		const done = spanEnded(2);
		const stream = newStream(() => stream.close());
		stream.start();
		await done;

		const ids = sentHeaders(fetchMock).map(headers => headers.get('X-Idempotency-ID'));
		expect(ids).toHaveLength(2);
		expect(ids[0]).not.toBe(ids[1]);
		expect(ended[0].attributes['http.response.status_code']).toBe(401);
		expect(ended[0].status.code).toBe(2);
		expect(ended[0].spanContext().traceId).not.toBe(ended[1].spanContext().traceId);
		expect(ended.every(span => span.parentSpanContext === undefined)).toBe(true);
		// Closed from the notification handler: the read ends cleanly, still marked as cancelled.
		expect(ended[1].attributes['coremart.cancelled']).toBe(true);
	});
});
