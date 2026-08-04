import { EVENT_TOPIC_DELIMITER, EVENT_TOPIC_WILDCARD, EventHandler, IEventBus } from './types';


type Subscription = {
	/** The pattern split once at subscribe time, so publishing never re-splits it. */
	parts: string[],
	handlers: Set<EventHandler<any>>,
};

/**
 * Same-context, synchronous event bus with wildcard topic matching.
 *
 * `BroadcastChannel` is deliberately NOT used: it never delivers a message back to
 * the context that posted it, so a component would never observe an event its own
 * service emitted — which is the whole point of `useSubscribeEvent`. Dispatch is
 * direct, and puts no structured-clone constraint on the payload.
 *
 * To add cross-tab delivery later, mirror `publish` onto a
 * `BroadcastChannel('nikkierp')` and have its `onmessage` dispatch locally with a
 * flag so it never re-posts.
 */
export class EventBus implements IEventBus {
	/**
	 * The single instance for the application, set by the Shell.
	 *
	 * Prefer reaching the bus through `HostServices` / `useEventBus()`. This exists
	 * for code that runs outside React and outside `init`, and for micro-apps mounted
	 * into a Shadow DOM, which get their own copy of this module.
	 */
	public static instance: IEventBus | undefined;

	/**
	 * Installs the host's bus, but only when none is set.
	 *
	 * - Light DOM (`SHARED`): the micro-app shares the Shell's module instance, so
	 *   `instance` is already the Shell's and this call does nothing.
	 * - Shadow DOM (`ISOLATED`): the separately-built bundle has its own copy of this
	 *   module, so the assignment succeeds and installs the Shell's bus.
	 */
	public static setInstance(bus: IEventBus): void {
		if (!EventBus.instance) {
			EventBus.instance = bus;
		}
	}

	readonly #subscriptions = new Map<string, Subscription>();

	public subscribe = <TPayload = unknown>(
		topicPattern: string, handler: EventHandler<TPayload>,
	): () => void => {
		const subscription = this.#ensureSubscription(topicPattern);
		subscription.handlers.add(handler);
		return () => {
			subscription.handlers.delete(handler);
			if (subscription.handlers.size === 0) {
				this.#subscriptions.delete(topicPattern);
			}
		};
	};

	public publish = <TPayload = unknown>(topic: string, payload: TPayload): void => {
		const topicParts = topic.split(EVENT_TOPIC_DELIMITER);
		this.#subscriptions.forEach(subscription => {
			if (!matchesTopic(subscription.parts, topicParts)) return;
			// Copy first: a handler may unsubscribe itself while we iterate.
			Array.from(subscription.handlers).forEach(handler => handler(payload, topic));
		});
	};

	#ensureSubscription(topicPattern: string): Subscription {
		let subscription = this.#subscriptions.get(topicPattern);
		if (!subscription) {
			subscription = { parts: topicPattern.split(EVENT_TOPIC_DELIMITER), handlers: new Set() };
			this.#subscriptions.set(topicPattern, subscription);
		}
		return subscription;
	}
}

/**
 * True when every pattern part matches the topic part at the same index.
 * The part counts must be equal — `*` stands for exactly one part.
 */
function matchesTopic(patternParts: string[], topicParts: string[]): boolean {
	if (patternParts.length !== topicParts.length) return false;
	return patternParts.every(
		(part, index) => part === EVENT_TOPIC_WILDCARD || part === topicParts[index],
	);
}

export function createEventBus(): IEventBus {
	return new EventBus();
}

/** Joins topic parts with the canonical delimiter, e.g. `iam:iam_user:create`. */
export function eventTopic(...parts: string[]): string {
	return parts.join(EVENT_TOPIC_DELIMITER);
}
