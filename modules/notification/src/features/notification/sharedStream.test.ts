import { afterEach, describe, expect, it, vi } from 'vitest';

import { SharedStreamRegistry } from './sharedStream';

import type { ChannelLike, LockManagerLike, SharedStreamDeps, SharedStreamListener } from './sharedStream';
import type { NotificationItem } from './types';


function item(seq: number): NotificationItem {
	return {
		notification_id: `n-${seq}`,
		stream_seq: seq,
		title: `title ${seq}`,
		message: `message ${seq}`,
		severity: 'info',
		source_module: 'sales',
		created_at: '2026-09-12T00:00:00Z',
		is_read: false,
	};
}

/** The browser's lock manager in miniature: one holder per name, waiters served in order. */
class FakeLocks implements LockManagerLike {
	readonly #queues = new Map<string, Array<() => void>>();
	readonly #held = new Set<string>();

	public request(name: string, options: { signal: AbortSignal }, callback: () => Promise<void>): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const grant = () => {
				this.#held.add(name);
				void callback().finally(() => {
					this.#held.delete(name);
					this.#queues.get(name)?.shift()?.();
					resolve(undefined);
				});
			};
			if (!this.#held.has(name)) {
				grant();
				return;
			}
			const queue = this.#queues.get(name) ?? [];
			queue.push(grant);
			this.#queues.set(name, queue);
			options.signal.addEventListener('abort', () => {
				const index = queue.indexOf(grant);
				if (index >= 0) queue.splice(index, 1);
				reject(new DOMException('aborted', 'AbortError'));
			});
		});
	}
}

/** Channels that, like BroadcastChannel, deliver to every other channel of the same name. */
function channelNetwork(): (name: string) => ChannelLike {
	const members = new Set<{ name: string, channel: ChannelLike }>();
	return name => {
		const member = {
			name,
			channel: {
				onmessage: null,
				postMessage: (message: unknown) => {
					members.forEach(other => {
						if (other !== member && other.name === name) {
							const event = { data: structuredClone(message) } as MessageEvent;
							queueMicrotask(() => other.channel.onmessage?.(event));
						}
					});
				},
				close: () => { members.delete(member); },
			} as ChannelLike,
		};
		members.add(member);
		return member.channel;
	};
}

/** A stream body the test pushes lines into, and which never ends on its own. */
function liveBody() {
	const encoder = new TextEncoder();
	let push: (seq: number) => void = () => { /* set in start */ };
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			push = seq => controller.enqueue(encoder.encode(
				`${JSON.stringify({ seq, type: 'notification.created', data: item(seq) })}\n`,
			));
		},
	});
	return { body, push: (seq: number) => push(seq) };
}

function listener(): SharedStreamListener & { seqs: number[], statuses: string[], reads: string[][] } {
	const seqs: number[] = [];
	const statuses: string[] = [];
	const reads: string[][] = [];
	return {
		seqs, statuses, reads,
		onNotification: notification => seqs.push(notification.stream_seq),
		onStatus: status => statuses.push(status),
		onRead: ids => reads.push(ids),
	};
}

function flush(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, 0));
}

function setup() {
	const locks = new FakeLocks();
	const createChannel = channelNetwork();
	const bodies: Array<ReturnType<typeof liveBody>> = [];
	const fetchMock = vi.fn().mockImplementation(() => {
		const live = liveBody();
		bodies.push(live);
		return Promise.resolve({ ok: true, status: 200, body: live.body });
	});
	vi.stubGlobal('fetch', fetchMock);
	const deps: SharedStreamDeps = { baseUrl: '/api', ensureSession: () => true, locks, createChannel };
	return { deps, fetchMock, bodies };
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('SharedStreamRegistry across tabs', () => {
	it('opens one server stream for two tabs and relays its notifications', async () => {
		const { deps, fetchMock, bodies } = setup();
		const tabA = listener();
		const tabB = listener();

		const handleA = new SharedStreamRegistry().acquire('org-1', deps, tabA);
		const handleB = new SharedStreamRegistry().acquire('org-1', deps, tabB);
		await flush();
		bodies[0].push(1);
		await flush();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(tabA.seqs).toEqual([1]);
		expect(tabB.seqs).toEqual([1]);
		// The follower learns the leader's state rather than guessing.
		expect(tabB.statuses.at(-1)).toBe('open');

		handleA.release();
		handleB.release();
	});

	it('hands the stream to the next tab, resuming after the last sequence seen', async () => {
		const { deps, fetchMock, bodies } = setup();
		const tabB = listener();

		const handleA = new SharedStreamRegistry().acquire('org-1', deps, listener());
		const handleB = new SharedStreamRegistry().acquire('org-1', deps, tabB);
		await flush();
		bodies[0].push(7);
		await flush();

		handleA.release();
		await flush();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(String(fetchMock.mock.calls[1][0])).toContain('after_seq=7');
		bodies[1].push(8);
		await flush();
		expect(tabB.seqs).toEqual([7, 8]);

		handleB.release();
	});

	it('keeps orgs apart', async () => {
		const { deps, fetchMock } = setup();

		const handleA = new SharedStreamRegistry().acquire('org-1', deps, listener());
		const handleB = new SharedStreamRegistry().acquire('org-2', deps, listener());
		await flush();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		handleA.release();
		handleB.release();
	});
});

describe('SharedStreamRegistry within a tab', () => {
	it('shares one hub between the bells of a document and closes it with the last release', async () => {
		const { deps, fetchMock } = setup();
		const registry = new SharedStreamRegistry();

		const first = registry.acquire('org-1', deps, listener());
		const second = registry.acquire('org-1', deps, listener());
		await flush();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const signal: AbortSignal = fetchMock.mock.calls[0][1].signal;

		first.release();
		expect(signal.aborted).toBe(false);
		second.release();
		expect(signal.aborted).toBe(true);
	});

	it('streams on its own when the browser cannot coordinate tabs', async () => {
		const { deps, fetchMock, bodies } = setup();
		const bell = listener();

		const handle = new SharedStreamRegistry().acquire('org-1', { ...deps, locks: null, createChannel: null }, bell);
		await flush();
		bodies[0].push(3);
		await flush();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(bell.seqs).toEqual([3]);
		handle.release();
	});
});

describe('SharedStreamRegistry read sync', () => {
	it('tells the other bells of the tab and of other tabs, but not the sender', async () => {
		const { deps } = setup();
		const registryA = new SharedStreamRegistry();
		const sender = listener();
		const sibling = listener();
		const otherTab = listener();

		const handle = registryA.acquire('org-1', deps, sender);
		const siblingHandle = registryA.acquire('org-1', deps, sibling);
		const otherHandle = new SharedStreamRegistry().acquire('org-1', deps, otherTab);
		await flush();

		handle.publishRead(['n-1', 'n-2']);
		await flush();

		expect(sender.reads).toEqual([]);
		expect(sibling.reads).toEqual([['n-1', 'n-2']]);
		expect(otherTab.reads).toEqual([['n-1', 'n-2']]);

		handle.release();
		siblingHandle.release();
		otherHandle.release();
	});
});
