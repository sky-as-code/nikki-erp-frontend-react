import { createEventBus } from '@nikkierp/common/eventBus';
import { SERVER_ERROR_TOPIC } from '@nikkierp/common/request';
import { describe, expect, it } from 'vitest';

import { subscribeServerErrorNotice } from './serverErrorNotice';
import { createShellNoticeStore } from './shellNoticeStore';


function setup() {
	const bus = createEventBus();
	const store = createShellNoticeStore();
	const unsubscribe = subscribeServerErrorNotice(bus, store, () => 'Server <down>');
	return { bus, store, unsubscribe };
}

describe('subscribeServerErrorNotice', () => {
	it('shows one escaped notice for a burst of failures', () => {
		const { bus, store, unsubscribe } = setup();
		bus.publish(SERVER_ERROR_TOPIC, { status: 500, url: '/a' });
		bus.publish(SERVER_ERROR_TOPIC, { status: 502, url: '/b' });

		const errors = store.getSnapshot().error;
		expect(errors).toHaveLength(1);
		expect(errors[0].html).toBe('Server &lt;down&gt;');
		unsubscribe();
	});

	it('shows the notice again once the previous one was dismissed', () => {
		const { bus, store, unsubscribe } = setup();
		bus.publish(SERVER_ERROR_TOPIC, { status: 500, url: '/a' });
		store.dismiss(store.getSnapshot().error[0].id);
		bus.publish(SERVER_ERROR_TOPIC, { status: 500, url: '/a' });

		expect(store.getSnapshot().error).toHaveLength(1);
		unsubscribe();
	});
});
