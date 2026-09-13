import { afterEach, describe, expect, it, vi } from 'vitest';

import { NotificationStream } from './stream';

import type { NotificationItem } from './types';


function item(seq: number, id = `n-${seq}`): NotificationItem {
	return {
		notification_id: id,
		stream_seq: seq,
		title: `title ${seq}`,
		message: `message ${seq}`,
		severity: 'info',
		source_module: 'sales',
		created_at: '2026-09-12T00:00:00Z',
		is_read: false,
	};
}

function line(seq: number, id?: string): string {
	return `${JSON.stringify({ seq, type: 'notification.created', data: item(seq, id) })}\n`;
}

/** A body that emits exactly the given chunks, then ends. */
function bodyOf(chunks: string[]): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
			controller.close();
		},
	});
}

/**
 * Runs one connection and resolves once the body has been consumed.
 *
 * The stream reconnects forever by design, so each test closes it as soon as the single response
 * it stubbed has been read — otherwise the retry loop would keep the test alive.
 */
async function collect(chunks: string[]): Promise<NotificationItem[]> {
	const received: NotificationItem[] = [];
	let stream: NotificationStream;

	const fetchMock = vi.fn().mockImplementation(() => Promise.resolve({
		ok: true,
		status: 200,
		body: bodyOf(chunks),
	}));
	vi.stubGlobal('fetch', fetchMock);

	await new Promise<void>(resolve => {
		stream = new NotificationStream({
			orgId: 'org-1',
			baseUrl: 'https://example.test/api',
			getAccessToken: () => 'token',
			onNotification: notification => received.push(notification),
			onStatus: status => {
				// 'reconnecting' means the stubbed body is exhausted and the loop is going round
				// again, which is the signal that everything deliverable has been delivered.
				if (status === 'reconnecting') {
					stream.close();
					resolve();
				}
			},
		});
		stream.start();
	});

	return received;
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('NotificationStream', () => {
	it('reads one notification per NDJSON line', async () => {
		const received = await collect([line(1), line(2)]);

		expect(received.map(notification => notification.stream_seq)).toEqual([1, 2]);
	});

	// The failure this guards against is the one that only shows up on a slow network: a chunk
	// boundary falling mid-line. A parser that treated a chunk as a line would corrupt both.
	it('reassembles a line split across chunks', async () => {
		const whole = line(7);
		const cut = Math.floor(whole.length / 2);

		const received = await collect([whole.slice(0, cut), whole.slice(cut)]);

		expect(received).toHaveLength(1);
		expect(received[0].stream_seq).toBe(7);
	});

	it('delivers several notifications arriving in one chunk', async () => {
		const received = await collect([line(1) + line(2) + line(3)]);

		expect(received.map(notification => notification.stream_seq)).toEqual([1, 2, 3]);
	});

	// The transport is at-least-once: a replay and the live push can carry the same notification.
	it('drops a notification whose sequence was already delivered', async () => {
		const received = await collect([line(5), line(5), line(4), line(6)]);

		expect(received.map(notification => notification.stream_seq)).toEqual([5, 6]);
	});

	it('ignores heartbeats', async () => {
		const received = await collect([`${JSON.stringify({ type: 'heartbeat' })}\n`, line(1)]);

		expect(received.map(notification => notification.stream_seq)).toEqual([1]);
	});

	// Forward compatibility: the server must be able to add event types without breaking a
	// client already in the field.
	it('ignores an unknown event type without ending the stream', async () => {
		const unknown = `${JSON.stringify({ seq: 9, type: 'notification.archived', data: item(9) })}\n`;

		const received = await collect([unknown, line(10)]);

		expect(received.map(notification => notification.stream_seq)).toEqual([10]);
	});

	it('skips an unreadable line and keeps reading', async () => {
		const received = await collect(['{ not json\n', line(3)]);

		expect(received.map(notification => notification.stream_seq)).toEqual([3]);
	});
});

describe('NotificationStream reconnect', () => {
	it('sends the bearer token and resumes from the last sequence on reconnect', async () => {
		const fetchMock = vi.fn()
			.mockImplementationOnce(() => Promise.resolve({ ok: true, status: 200, body: bodyOf([line(11)]) }))
			.mockImplementation(() => Promise.resolve({ ok: true, status: 200, body: bodyOf([]) }));
		vi.stubGlobal('fetch', fetchMock);

		let stream: NotificationStream;
		let reconnects = 0;

		await new Promise<void>(resolve => {
			stream = new NotificationStream({
				orgId: 'org-1',
				baseUrl: 'https://example.test/api/',
				getAccessToken: () => 'the-token',
				onNotification: () => { /* asserted through the request below */ },
				onStatus: status => {
					if (status !== 'reconnecting') return;
					reconnects += 1;
					// Let the second connect actually happen before inspecting its URL.
					if (reconnects === 2) {
						stream.close();
						resolve();
					}
				},
			});
			stream.start();
		});

		const [firstUrl, firstInit] = fetchMock.mock.calls[0];
		expect(String(firstUrl)).toContain('org_id=org-1');
		expect(String(firstUrl)).not.toContain('after_seq');
		expect(firstInit.headers.Authorization).toBe('Bearer the-token');

		// The whole point of the cursor: the second attempt asks only for what came after 11.
		const [secondUrl] = fetchMock.mock.calls[1];
		expect(String(secondUrl)).toContain('after_seq=11');
	}, 10_000);
});
