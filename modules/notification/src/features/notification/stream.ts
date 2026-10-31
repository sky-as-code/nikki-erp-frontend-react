import { STREAM_EVENT_HEARTBEAT, STREAM_EVENT_NOTIFICATION_CREATED } from './types';
import { STREAM_PATH } from '../../constants';


import type { NotificationItem, StreamEvent } from './types';


export type StreamOptions = {
	/** The organization whose notifications this stream carries. */
	orgId: string,

	/**
	 * Refreshes the session cookies when they lapse soon, or regardless with `force`. The browser
	 * sends the cookies itself; this only makes sure they are current before connecting.
	 */
	ensureSession: (options?: { force?: boolean }) => Promise<boolean> | boolean,

	/** The API base URL the Shell handed the micro-app. */
	baseUrl: string,

	/** Called for each notification, already de-duplicated by sequence. */
	onNotification: (item: NotificationItem) => void,

	/** Called when the connection state changes, for a UI that shows it. */
	onStatus?: (status: StreamStatus) => void,

	/**
	 * The sequence to resume after on the first connect. A tab taking over a shared stream passes
	 * the last sequence the tabs saw, so the handover neither repeats nor skips a notification.
	 */
	initialLastSeq?: number | null,

	/**
	 * Called whenever the server sends anything, heartbeats included. Driven by the network, not
	 * a timer, so it keeps firing in a background tab whose timers the browser throttles.
	 */
	onActivity?: () => void,
};

export type StreamStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

/** Backoff bounds. The first retry is nearly immediate; a persistent outage settles at the cap. */
const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/**
 * Reads the NDJSON notification stream.
 *
 * It uses `fetch` directly rather than the shared `RequestMaker`: that one is built on ky, which
 * parses a whole response body, and this response never completes. It is not an `EventSource`
 * either: the session cookie would travel with one, but it cannot react to a 401 by refreshing the
 * session first, and it cannot send the `Accept` the server streams NDJSON for.
 *
 * Everything `EventSource` would have given for free is therefore hand-written here: reconnection,
 * backoff, and resuming from the last sequence actually processed.
 */
export class NotificationStream {
	readonly #options: StreamOptions;

	#abort: AbortController | null = null;
	#closed = false;
	#retryMs = RETRY_BASE_MS;
	#retryTimer: ReturnType<typeof setTimeout> | null = null;
	#retryResolve: (() => void) | null = null;
	#refreshedAfterRefusal = false;

	/**
	 * The highest sequence handed to the caller. It is what the server replays from after a
	 * disconnect, and it is deliberately advanced only AFTER the caller has been told, so that a
	 * notification dropped mid-handling is re-sent rather than skipped.
	 */
	#lastSeq: number | null = null;

	public constructor(options: StreamOptions) {
		this.#options = options;
		this.#lastSeq = options.initialLastSeq ?? null;
	}

	/** Opens the stream and keeps it open until `close()`. Safe to call once. */
	public start(): void {
		if (this.#closed) return;
		void this.#connectLoop();
	}

	/**
	 * Closes the stream for good.
	 *
	 * Aborting the fetch is what ends the server's response: without it the backend holds an open
	 * connection for a client that is gone, until its own heartbeat write fails.
	 */
	public close(): void {
		if (this.#closed) return;
		this.#closed = true;
		if (this.#retryTimer) {
			clearTimeout(this.#retryTimer);
			this.#retryTimer = null;
		}
		// Settles a pending backoff so the loop sees `#closed` and ends, instead of waiting forever
		// on a timer that will never fire.
		this.#retryResolve?.();
		this.#retryResolve = null;
		this.#abort?.abort();
		this.#abort = null;
		this.#options.onStatus?.('closed');
	}

	/** The cursor a caller may persist to resume across a page reload. */
	public get lastSeq(): number | null {
		return this.#lastSeq;
	}

	async #connectLoop(): Promise<void> {
		while (!this.#closed) {
			try {
				this.#options.onStatus?.(this.#lastSeq == null ? 'connecting' : 'reconnecting');
				const refused = await this.#connectOnce();
				if (refused && await this.#refreshAfterRefusal()) continue;

				// A clean end of body is still a disconnect: the server shut down, or a proxy
				// closed an idle connection. Reconnect rather than going quiet.
			}
			catch (error) {
				if (this.#closed || isAbortError(error)) return;
			}

			if (this.#closed) return;
			await this.#waitBeforeRetry();
		}
	}

	/**
	 * The access cookie lapsed under the stream: refresh it and reconnect at once, since waiting
	 * out a backoff would not help. Once per refusal streak, so a server that keeps refusing a
	 * freshly refreshed session falls back to the backoff instead of a tight loop.
	 */
	async #refreshAfterRefusal(): Promise<boolean> {
		if (this.#refreshedAfterRefusal) return false;
		this.#refreshedAfterRefusal = true;
		const refreshed = Boolean(await this.#options.ensureSession({ force: true }));
		return refreshed && !this.#closed;
	}

	/** Resolves `true` when the server refused the session, so the caller can refresh and retry. */
	async #connectOnce(): Promise<boolean> {
		await this.#options.ensureSession();
		// `close()` during the await above had no fetch to abort yet. Connecting now would open a
		// response nobody reads, holding one of the browser's few connections per host for good.
		if (this.#closed) return false;
		const abort = new AbortController();
		this.#abort = abort;

		const response = await fetch(this.#streamUrl(), {
			method: 'GET',
			headers: { Accept: 'application/x-ndjson' },
			credentials: 'same-origin',
			signal: abort.signal,
		});

		if (response.status === 401) return true;
		if (!response.ok || !response.body) {
			throw new Error(`notification stream failed: ${response.status}`);
		}

		this.#options.onStatus?.('open');
		// Only after a successful connect: resetting on the attempt would turn a server that
		// accepts and immediately drops into a tight reconnect loop.
		this.#retryMs = RETRY_BASE_MS;
		this.#refreshedAfterRefusal = false;

		await this.#readBody(response.body);
		return false;
	}

	/**
	 * Reads the body as NDJSON.
	 *
	 * The buffer is the substance of this method: a chunk boundary falls wherever the network puts
	 * it, frequently mid-line, so a parser that assumed one chunk is one line would corrupt every
	 * notification that happened to straddle one.
	 */
	async #readBody(body: ReadableStream<Uint8Array>): Promise<void> {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		try {
			// `#closed` is checked before each read as well as after: a caller that closes from
			// inside `onNotification` must not leave this loop parked on a read nobody wants.
			while (!this.#closed) {
				const { done, value } = await reader.read();
				if (done || this.#closed) return;
				this.#options.onActivity?.();

				buffer += decoder.decode(value, { stream: true });

				let newline = buffer.indexOf('\n');
				while (newline >= 0) {
					const line = buffer.slice(0, newline).trim();
					buffer = buffer.slice(newline + 1);
					if (line) this.#handleLine(line);
					newline = buffer.indexOf('\n');
				}
			}
		}
		finally {
			reader.cancel().catch(() => { /* the connection is already gone */ });
		}
	}

	#handleLine(line: string): void {
		let event: StreamEvent;
		try {
			event = JSON.parse(line) as StreamEvent;
		}
		catch {
			// One unreadable line must not end the stream: every other notification on this
			// connection is still deliverable.
			return;
		}

		if (this.#closed) return;

		// A heartbeat carries no sequence and means nothing to the user.
		if (event.type === STREAM_EVENT_HEARTBEAT) return;

		// An event type this client does not know is ignored rather than treated as an error, so
		// the server can add types without breaking a deployed client.
		if (event.type !== STREAM_EVENT_NOTIFICATION_CREATED || !event.data) return;

		// The transport is at-least-once: a replay and the live push can both carry the same
		// notification. The sequence is what settles it.
		if (event.seq != null && this.#lastSeq != null && event.seq <= this.#lastSeq) return;

		this.#options.onNotification(event.data);
		if (event.seq != null) this.#lastSeq = event.seq;
	}

	#streamUrl(): string {
		const base = this.#options.baseUrl.replace(/\/+$/, '');
		const params = new URLSearchParams({ org_id: this.#options.orgId });
		if (this.#lastSeq != null) {
			params.set('after_seq', String(this.#lastSeq));
		}
		return `${base}/${STREAM_PATH}?${params.toString()}`;
	}

	#waitBeforeRetry(): Promise<void> {
		const delay = this.#retryMs;
		// Exponential, capped. A backend that is down does not benefit from being asked faster.
		this.#retryMs = Math.min(this.#retryMs * 2, RETRY_MAX_MS);

		return new Promise(resolve => {
			this.#retryResolve = resolve;
			this.#retryTimer = setTimeout(() => {
				this.#retryTimer = null;
				this.#retryResolve = null;
				resolve();
			}, delay);
		});
	}
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError';
}
