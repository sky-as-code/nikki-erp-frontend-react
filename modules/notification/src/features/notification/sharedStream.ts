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

	/** Where the Page Lifecycle `freeze` / `resume` events arrive. Defaults to `document`. */
	lifecycle?: LifecycleTarget | null,
};

export type SharedStreamHandle = {
	/** Tells every other bell these notifications are now read. Call it after the server agreed. */
	publishRead: (notificationIds: string[]) => void,

	/**
	 * Records a sequence this bell already shows (e.g. the newest of its loaded inbox page), so a
	 * tab taking over the stream resumes after it even when no live notification has arrived yet.
	 */
	noteSeen: (seq: number) => void,
	release: () => void,
};

/** The part of the Web Locks `LockManager` this file uses, so tests can supply their own. */
export type LockManagerLike = {
	request: (
		name: string, options: { signal?: AbortSignal, steal?: boolean }, callback: () => Promise<void>,
	) => Promise<unknown>,
};

/** The part of `BroadcastChannel` this file uses. */
export type ChannelLike = {
	postMessage: (message: unknown) => void,
	onmessage: ((event: MessageEvent) => void) | null,
	close: () => void,
};

export type LifecycleTarget = {
	addEventListener: (type: string, listener: () => void) => void,
	removeEventListener: (type: string, listener: () => void) => void,
};

type ChannelMessage =
	| { type: 'created', item: NotificationItem }
	| { type: 'status', status: StreamStatus }
	| { type: 'status_request' }
	| { type: 'heartbeat' }
	| { type: 'read', ids: string[] };

const LOCK_PREFIX = 'nikki.notification.stream:';
const CHANNEL_PREFIX = 'nikki.notification:';

/**
 * How often the leader says it is alive, besides relaying every server heartbeat. The server's
 * own heartbeat (20 s by default, but per-org configurable) is what keeps a throttled background
 * leader audible; this timer covers an org that configured a long one.
 */
export const LEADER_PULSE_MS = 15_000;

/** Silence after which a follower presumes the leader frozen and takes the lock by force. */
export const LEADER_STALE_MS = 45_000;

/**
 * One org's notification stream, shared by every bell of a document and, through a leader tab,
 * by every tab of the browser.
 *
 * Why it exists: the BFF speaks HTTP/1.1, where the browser keeps at most six connections per
 * host for the whole profile, and a stream holds one for as long as it lives. One stream per bell
 * per tab ran out of connections at three tabs, after which every request in every tab queued
 * forever. The holder of the Web Lock streams and rebroadcasts; the others listen. The browser
 * frees the lock when the leader's tab goes away, which hands the stream to the next tab.
 *
 * A leader can also stop without going away: a frozen tab keeps its lock but runs no code. It
 * steps down on `freeze` where the browser announces it; where it does not, the followers notice
 * the silence and steal the lock (see `LEADER_STALE_MS`).
 */
class SharedStreamHub {
	readonly #orgId: string;
	readonly #deps: SharedStreamDeps;
	readonly #listeners = new Set<SharedStreamListener>();
	#locks: LockManagerLike | null = null;
	#lifecycle: LifecycleTarget | null = null;
	#channel: ChannelLike | null = null;
	#lockAbort: AbortController | null = null;
	#stream: NotificationStream | null = null;
	#endLeadership: (() => void) | null = null;

	/** The lock request that made this tab leader; a rejection of any other one is not a steal. */
	#leadingRequest: object | null = null;
	#pulseTimer: ReturnType<typeof setInterval> | null = null;
	#watchdogTimer: ReturnType<typeof setTimeout> | null = null;
	#isLeader = false;
	#frozen = false;
	#disposed = false;
	#status: StreamStatus = 'connecting';

	/** The newest sequence this document knows of; a new leader resumes after it. */
	#lastSeq: number | null = null;

	public constructor(orgId: string, deps: SharedStreamDeps) {
		this.#orgId = orgId;
		this.#deps = deps;
	}

	public get isEmpty(): boolean {
		return this.#listeners.size === 0;
	}

	public start(): void {
		this.#locks = this.#deps.locks === undefined ? defaultLocks() : this.#deps.locks;
		const createChannel = this.#deps.createChannel === undefined ? defaultChannel() : this.#deps.createChannel;
		if (!this.#locks || !createChannel) {
			// No way to coordinate with other tabs: this tab streams for itself, which at least still
			// shares the one connection among the bells of this document.
			void this.#lead();
			return;
		}

		this.#channel = createChannel(CHANNEL_PREFIX + this.#orgId);
		this.#channel.onmessage = event => this.#onMessage(event.data);
		this.#lifecycle = this.#deps.lifecycle === undefined ? defaultLifecycle() : this.#deps.lifecycle;
		this.#lifecycle?.addEventListener('freeze', this.#onFreeze);
		this.#lifecycle?.addEventListener('resume', this.#onResume);

		this.#post({ type: 'status_request' });
		this.#requestLock(false);
		this.#armWatchdog();
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

	public noteSeen(seq: number): void {
		if (this.#lastSeq == null || seq > this.#lastSeq) this.#lastSeq = seq;
	}

	public dispose(): void {
		this.#disposed = true;
		this.#lifecycle?.removeEventListener('freeze', this.#onFreeze);
		this.#lifecycle?.removeEventListener('resume', this.#onResume);
		this.#disarmWatchdog();
		this.#lockAbort?.abort();
		this.#stepDown();
		this.#channel?.close();
		this.#channel = null;
	}

	/**
	 * Queues for the lock, or with `steal` takes it from a holder presumed frozen. A request's
	 * promise rejects when it is aborted while waiting (ours, ignored) or when another tab steals
	 * the lock from under a running leader, which must then stop streaming and queue again.
	 */
	#requestLock(steal: boolean): void {
		if (!this.#locks) return;
		this.#lockAbort?.abort();
		// The Web Locks API refuses `steal` together with `signal`; a steal is never left waiting.
		const abort = steal ? null : new AbortController();
		this.#lockAbort = abort;
		const options = abort ? { signal: abort.signal } : { steal: true };
		const request = {};

		const lead = () => {
			this.#leadingRequest = request;
			return this.#lead();
		};
		this.#locks.request(LOCK_PREFIX + this.#orgId, options, lead)
			.catch(() => {
				if (this.#leadingRequest !== request || this.#disposed) return;
				this.#stepDown();
				if (!this.#frozen) this.#requestLock(false);
			});
	}

	/** Runs while this tab holds the lock; the lock is held until the promise settles. */
	#lead(): Promise<void> {
		if (this.#disposed || this.#frozen) return Promise.resolve();
		this.#isLeader = true;
		this.#disarmWatchdog();
		this.#stream = this.#openStream();
		this.#stream.start();
		if (this.#channel) {
			this.#pulseTimer = setInterval(() => this.#post({ type: 'heartbeat' }), LEADER_PULSE_MS);
		}
		return new Promise(resolve => { this.#endLeadership = resolve; });
	}

	#openStream(): NotificationStream {
		return new NotificationStream({
			orgId: this.#orgId,
			baseUrl: this.#deps.baseUrl,
			ensureSession: this.#deps.ensureSession,
			initialLastSeq: this.#lastSeq,
			onNotification: item => {
				if (this.#deliver(item)) this.#post({ type: 'created', item });
			},
			onStatus: status => {
				// The stream reports 'closed' when this tab stops leading, which is not news for the
				// tabs that carry on through the next leader.
				if (!this.#isLeader) return;
				this.#setStatus(status);
				this.#post({ type: 'status', status });
			},
			onActivity: () => this.#post({ type: 'heartbeat' }),
		});
	}

	/** Stops streaming and, by ending the lock callback, hands the lock to the next tab. */
	#stepDown(): void {
		this.#isLeader = false;
		this.#leadingRequest = null;
		if (this.#pulseTimer) clearInterval(this.#pulseTimer);
		this.#pulseTimer = null;
		this.#stream?.close();
		this.#stream = null;
		this.#endLeadership?.();
		this.#endLeadership = null;
		this.#armWatchdog();
	}

	/**
	 * Chrome is about to freeze this tab. A frozen leader would hold the lock and relay nothing,
	 * and a frozen follower granted the lock would do the same, so both give up their claim now.
	 */
	readonly #onFreeze = (): void => {
		this.#frozen = true;
		this.#disarmWatchdog();
		this.#lockAbort?.abort();
		this.#lockAbort = null;
		if (this.#isLeader) this.#stepDown();
	};

	readonly #onResume = (): void => {
		if (this.#disposed || !this.#frozen) return;
		this.#frozen = false;
		this.#post({ type: 'status_request' });
		this.#requestLock(false);
		this.#armWatchdog();
	};

	#armWatchdog(): void {
		this.#disarmWatchdog();
		if (this.#disposed || this.#frozen || this.#isLeader || !this.#channel) return;
		this.#watchdogTimer = setTimeout(() => this.#requestLock(true), LEADER_STALE_MS);
	}

	#disarmWatchdog(): void {
		if (this.#watchdogTimer) clearTimeout(this.#watchdogTimer);
		this.#watchdogTimer = null;
	}

	#onMessage(data: unknown): void {
		if (this.#disposed || this.#frozen || !isChannelMessage(data)) return;
		// Anything a leader sends proves it alive; `read` comes from any bell, leader or not.
		if (data.type === 'created' || data.type === 'status' || data.type === 'heartbeat') this.#armWatchdog();
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
			noteSeen: seq => { if (!released) owner.noteSeen(seq); },
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

function defaultLifecycle(): LifecycleTarget | null {
	return typeof document === 'undefined' ? null : document;
}

/** Messages come from other tabs of the same origin, but possibly from an older deployed build. */
function isChannelMessage(data: unknown): data is ChannelMessage {
	if (typeof data !== 'object' || data === null) return false;
	const message = data as { type?: unknown, item?: { stream_seq?: unknown }, ids?: unknown, status?: unknown };
	switch (message.type) {
		case 'created': return typeof message.item?.stream_seq === 'number';
		case 'status': return typeof message.status === 'string';
		case 'status_request':
		case 'heartbeat': return true;
		case 'read': return Array.isArray(message.ids);
		default: return false;
	}
}
