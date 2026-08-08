import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createEventBus, EventBus, eventTopic } from './eventBus';


describe('EventBus topic matching', () => {
	it('delivers to an exact topic', () => {
		const bus = createEventBus();
		const handler = vi.fn();
		bus.subscribe('iam:iam_user:create', handler);

		bus.publish('iam:iam_user:create', { id: '1' });

		expect(handler).toHaveBeenCalledOnce();
		expect(handler).toHaveBeenCalledWith({ id: '1' }, 'iam:iam_user:create');
	});

	it('matches a wildcard in the middle part', () => {
		const bus = createEventBus();
		const handler = vi.fn();
		bus.subscribe('iam:*:get', handler);

		bus.publish('iam:iam_user:get', 1);
		bus.publish('iam:iam_group:get', 2);
		bus.publish('iam:iam_user:create', 3);

		expect(handler).toHaveBeenCalledTimes(2);
		expect(handler.mock.calls.map(call => call[1]))
			.toEqual(['iam:iam_user:get', 'iam:iam_group:get']);
	});

	it('matches leading wildcards across modules', () => {
		const bus = createEventBus();
		const handler = vi.fn();
		bus.subscribe('*:*:get', handler);

		bus.publish('iam:iam_user:get', 1);
		bus.publish('inventory:inventory_product:get', 2);

		expect(handler).toHaveBeenCalledTimes(2);
	});

	it('treats `*` as exactly one part, not a multi-part glob', () => {
		const bus = createEventBus();
		const single = vi.fn();
		const triple = vi.fn();
		bus.subscribe('*', single);
		bus.subscribe('*:*:*', triple);

		bus.publish('ping', 1);
		bus.publish('iam:iam_user:get', 2);
		bus.publish('a:b:c:d', 3);

		expect(single).toHaveBeenCalledOnce();
		expect(single).toHaveBeenCalledWith(1, 'ping');
		expect(triple).toHaveBeenCalledOnce();
		expect(triple).toHaveBeenCalledWith(2, 'iam:iam_user:get');
	});

	it('does not match when the part count differs', () => {
		const bus = createEventBus();
		const handler = vi.fn();
		bus.subscribe('iam:*:get', handler);

		bus.publish('iam:iam_user:extra:get', 1);
		bus.publish('iam:get', 2);

		expect(handler).not.toHaveBeenCalled();
	});
});

describe('EventBus subscriptions', () => {
	it('supports many subscribers on one pattern', () => {
		const bus = createEventBus();
		const first = vi.fn();
		const second = vi.fn();
		bus.subscribe('iam:iam_user:create', first);
		bus.subscribe('iam:iam_user:create', second);

		bus.publish('iam:iam_user:create', 1);

		expect(first).toHaveBeenCalledOnce();
		expect(second).toHaveBeenCalledOnce();
	});

	it('unsubscribe removes only the one handler', () => {
		const bus = createEventBus();
		const kept = vi.fn();
		const removed = vi.fn();
		bus.subscribe('iam:iam_user:create', kept);
		const unsubscribe = bus.subscribe('iam:iam_user:create', removed);

		unsubscribe();
		bus.publish('iam:iam_user:create', 1);

		expect(kept).toHaveBeenCalledOnce();
		expect(removed).not.toHaveBeenCalled();
	});

	it('tolerates a handler unsubscribing itself mid-publish', () => {
		const bus = createEventBus();
		const later = vi.fn();
		const unsubscribe = bus.subscribe('topic', () => unsubscribe());
		bus.subscribe('topic', later);

		expect(() => bus.publish('topic', 1)).not.toThrow();
		expect(later).toHaveBeenCalledOnce();
	});

	it('delivers to the publishing context — the reason BroadcastChannel is unused', () => {
		const bus = createEventBus();
		const handler = vi.fn();
		bus.subscribe('iam:iam_user:update', handler);

		bus.publish('iam:iam_user:update', 1);

		expect(handler).toHaveBeenCalledOnce();
	});
});

describe('EventBus.setInstance', () => {
	beforeEach(() => {
		EventBus.instance = undefined;
	});

	it('installs the bus when none is set (Shadow DOM micro-app)', () => {
		const bus = createEventBus();
		EventBus.setInstance(bus);
		expect(EventBus.instance).toBe(bus);
	});

	it('does not overwrite an existing instance (Light DOM micro-app)', () => {
		const shellBus = createEventBus();
		const microAppBus = createEventBus();

		EventBus.setInstance(shellBus);
		EventBus.setInstance(microAppBus);

		expect(EventBus.instance).toBe(shellBus);
	});
});

describe('eventTopic', () => {
	it('joins parts with the canonical delimiter', () => {
		expect(eventTopic('iam', 'iam_user', 'create')).toBe('iam:iam_user:create');
	});
});
