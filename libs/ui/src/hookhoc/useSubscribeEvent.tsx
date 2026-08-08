import React from 'react';

import { useEventBus } from '../microApp';

import type { EventHandler } from '@nikkierp/common/eventBus';


/**
 * Invokes `callback` whenever an event matching `topicPattern` is published.
 *
 * The pattern may use `*` for any single topic part, e.g. `iam:*:create`. The
 * subscription is torn down on unmount.
 *
 * `callback` is held in a ref, so passing an inline arrow does not resubscribe on
 * every render — only a changed `topicPattern` does.
 */
export function useSubscribeEvent<TPayload = unknown>(
	topicPattern: string, callback: EventHandler<TPayload>,
): void {
	const eventBus = useEventBus();
	const callbackRef = React.useRef(callback);

	React.useEffect(() => {
		callbackRef.current = callback;
	});

	React.useEffect(
		() => eventBus.subscribe<TPayload>(topicPattern, (payload, topic) => {
			callbackRef.current(payload, topic);
		}),
		[eventBus, topicPattern],
	);
}
