/**
 * Receives a published event. `topic` is the concrete topic that matched, which may
 * differ from the pattern the handler subscribed with.
 */
export type EventHandler<TPayload = unknown> = (payload: TPayload, topic: string) => void;

/**
 * Application-wide publish/subscribe for domain events.
 *
 * Topics are colon-delimited with an unlimited number of parts:
 * `{part1}:{part2}:{part3}`. Services emit `{module}:{resource}:{action}`, e.g.
 * `iam:iam_user:create`.
 *
 * A subscription pattern may use `*` for any single part — `iam:*:create` matches
 * `iam:iam_user:create` and `iam:iam_group:create`. `*` is not a multi-part glob:
 * the part count must match, so `*` alone matches only 1-part topics.
 */
export interface IEventBus {
	/**
	 * Subscribes `handler` to every topic matching `topicPattern`. Returns an
	 * unsubscribe function.
	 *
	 * An arrow property, not a method: `useSyncExternalStore` and `useEffect`
	 * resubscribe on every render unless the reference is stable.
	 */
	subscribe: <TPayload = unknown>(topicPattern: string, handler: EventHandler<TPayload>) => () => void;

	/** Notifies every handler whose pattern matches `topic`, synchronously. */
	publish: <TPayload = unknown>(topic: string, payload: TPayload) => void;
}

export const EVENT_TOPIC_DELIMITER = ':';

export const EVENT_TOPIC_WILDCARD = '*';
