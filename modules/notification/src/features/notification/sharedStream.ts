import { NotificationStream } from './stream';

import type { StreamStatus } from './stream';
import type { NotificationItem } from './types';


/** What one bell wants to hear from the org's stream. */
export type SharedStreamListener = {
	onNotification: (item: NotificationItem) => void,
	onStatus?: (status: StreamStatus) => void,

	/** Another bell, in this tab or another, marked these notifications read on the server. */
	onRead?: (notificationIds: string[]) => void,
};

export type SharedStreamDeps = {
	baseUrl: string,
	ensureSession: (options?: { force?: boolean }) => Promise<boolean> | boolean,

	/** Defaults to `navigator.locks`; `null` forces a stream of this tab's own. */
	locks?: LockManagerLike | null,

	/** Defaults to `BroadcastChannel`; `null` forces a stream of this tab's own. */
	createChannel?: ((name: string) => ChannelLike) | null,
};

export type SharedStreamHandle = {
	/** Tells every other bell these notifications are now read. Call it after the server agreed. */
	publishRead: (notificationIds: string[]) => void,
	release: () => void,
};

/** The part of the Web Locks `LockManager` this file uses, so tests can supply their own. */
export type LockManagerLike = {
	request: (name: string, options: { signal: AbortSignal }, callback: () => Promise<void>) => Promise<unknown>,
};

/** The part of `BroadcastChannel` this file uses. */
export type ChannelLike = {
	postMessage: (message: unknown) => void,
	onmessage: ((event: MessageEvent) => void) | null,
	close: () => void,
};

type ChannelMessage =
	| { type: 'created', item: NotificationItem }
	| { type: 'status', status: StreamStatus }
	| { type: 'status_request' }
	| { type: 'read', ids: string[] };

const LOCK_PREFIX = 'nikki.notification.stream:';
const CHANNEL_PREFIX = 'nikki.notification:';

/**
 * One org's notification stream, shared by every bell of a document and, through a leader tab,
 * by every tab of the browser.
 *
 * Why it exists: the BFF speaks HTTP/1.1, where the browser keeps at most six connections per
 * host for the whole profile, and a stream holds one for as long as it lives. One stream per bell
 * per tab ran out of connections at three tabs, after which every request in every tab queued
 * forever. The holder of the Web Lock streams and rebroadcasts; the others listen. The browser
 * frees the lock when the leader's tab goes away, which hands the stream to the next tab with no
 * heartbeat of our own.
 */
class SharedStreamHub {
	readonly #orgId: string;
	readonly #deps: SharedStreamDeps;
	readonly #listeners = new Set<SharedStreamListener>();
	readonly #lockAbort = new AbortController();
	#channel: ChannelLike | null = null;
	#stream: NotificationStream | null = null;
	#endLeadership: (() => void) | null = null;
	#isLeader = false;
	#disposed = false;
	#status: StreamStatus = 'connecting';

	/** The newest sequence any tab delivered; a new leader resumes after it. */
	#lastSeq: number | null = null;

	public constructor(orgId: string, deps: SharedStreamDeps) {
		this.#orgId = orgId;
		this.#deps = deps;
	}

	public get isEmpty(): boolean {
		return this.#listeners.size === 0;
	}

	public start(): void {
		const locks = this.#deps.locks === undefined ? defaultLocks() : this.#deps.locks;
		const createChannel = this.#deps.createChannel === undefined ? defaultChannel() : this.#deps.createChannel;
		if (!locks || !createChannel) {
			// No way to coordinate with other tabs: this tab streams for itself, which at least still
			// shares the one connection among the bells of this document.
			void this.#lead();
			return;
		}

		this.#channel = createChannel(CHANNEL_PREFIX + this.#orgId);
		this.#channel.onmessage = event => this.#onMessage(event.data);
		this.#post({ type: 'status_request' });

		locks.request(LOCK_PREFIX + this.#orgId, { signal: this.#lockAbort.signal }, () => this.#lead())
			.catch(() => { /* aborted while waiting for the lock: this tab never led */ });
	}

	public add(listener: SharedStreamListener): void {
		this.#listeners.add(listener);
		listener.onStatus?.(this.#status);
	}

	public remove(listener: SharedStreamListener): void {
		this.#listeners.delete(listener);
	}

	public publishRead(sender: SharedStreamListener, notificationIds: string[]): void {
		if (notificationIds.length === 0) return;
		this.#listeners.forEach(listener => {
			if (listener !== sender) listener.onRead?.(notificationIds);
		});
		this.#post({ type: 'read', ids: notificationIds });
	}

	public dispose(): void {
		this.#disposed = true;
		this.#lockAbort.abort();
		this.#stream?.close();
		this.#stream = null;
		// Ending the lock callback is what releases the lock to the next tab.
		this.#endLeadership?.();
		this.#endLeadership = null;
		this.#channel?.close();
		this.#channel = null;
	}

	/** Runs while this tab holds the lock; the lock is held until the promise settles. */
	#lead(): Promise<void> {
		if (this.#disposed) return Promise.resolve();
		this.#isLeader = true;
		this.#stream = new NotificationStream({
			orgId: this.#orgId,
			baseUrl: this.#deps.baseUrl,
			ensureSession: this.#deps.ensureSession,
			initialLastSeq: this.#lastSeq,
			onNotification: item => {
				if (this.#deliver(item)) this.#post({ type: 'created', item });
			},
			onStatus: status => {
				// The stream reports 'closed' when this tab stops leading, which is not news for the
				// tabs that will carry on through the next leader.
				if (this.#disposed) return;
				this.#setStatus(status);
				this.#post({ type: 'status', status });
			},
		});
		this.#stream.start();
		return new Promise(resolve => { this.#endLeadership = resolve; });
	}

	#onMessage(data: unknown): void {
		if (this.#disposed || !isChannelMessage(data)) return;
		switch (data.type) {
			case 'created':
				this.#deliver(data.item);
				break;
			case 'status':
				if (!this.#isLeader) this.#setStatus(data.status);
				break;
			case 'status_request':
				if (this.#isLeader) this.#post({ type: 'status', status: this.#status });
				break;
			case 'read':
				this.#listeners.forEach(listener => listener.onRead?.(data.ids));
				break;
		}
	}

	/** Hands a notification to this document's bells once; `false` when it was already seen. */
	#deliver(item: NotificationItem): boolean {
		if (this.#lastSeq != null && item.stream_seq <= this.#lastSeq) return false;
		this.#lastSeq = item.stream_seq;
		this.#listeners.forEach(listener => listener.onNotification(item));
		return true;
	}

	#setStatus(status: StreamStatus): void {
		this.#status = status;
		this.#listeners.forEach(listener => listener.onStatus?.(status));
	}

	#post(message: ChannelMessage): void {
		this.#channel?.postMessage(message);
	}
}

/**
 * The hubs of one document. The module keeps one for the page; tests make one per simulated tab.
 */
export class SharedStreamRegistry {
	readonly #hubs = new Map<string, SharedStreamHub>();

	public acquire(orgId: string, deps: SharedStreamDeps, listener: SharedStreamListener): SharedStreamHandle {
		let hub = this.#hubs.get(orgId);
		if (!hub) {
			hub = new SharedStreamHub(orgId, deps);
			this.#hubs.set(orgId, hub);
			hub.start();
		}
		const owner = hub;
		owner.add(listener);

		let released = false;
		return {
			publishRead: ids => { if (!released) owner.publishRead(listener, ids); },
			release: () => {
				if (released) return;
				released = true;
				owner.remove(listener);
				if (owner.isEmpty && this.#hubs.get(orgId) === owner) {
					this.#hubs.delete(orgId);
					owner.dispose();
				}
			},
		};
	}
}

const documentRegistry = new SharedStreamRegistry();

/**
 * Joins the org's shared notification stream. Every call must be paired with `release()`; the
 * stream, and this tab's claim to lead it, end with the last release.
 */
export function acquireSharedStream(
	orgId: string, deps: SharedStreamDeps, listener: SharedStreamListener,
): SharedStreamHandle {
	return documentRegistry.acquire(orgId, deps, listener);
}

function defaultLocks(): LockManagerLike | null {
	return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks : null;
}

function defaultChannel(): ((name: string) => ChannelLike) | null {
	return typeof BroadcastChannel === 'undefined' ? null : name => new BroadcastChannel(name);
}

/** Messages come from other tabs of the same origin, but possibly from an older deployed build. */
function isChannelMessage(data: unknown): data is ChannelMessage {
	if (typeof data !== 'object' || data === null) return false;
	const message = data as { type?: unknown, item?: { stream_seq?: unknown }, ids?: unknown, status?: unknown };
	switch (message.type) {
		case 'created': return typeof message.item?.stream_seq === 'number';
		case 'status': return typeof message.status === 'string';
		case 'status_request': return true;
		case 'read': return Array.isArray(message.ids);
		default: return false;
	}
}
