import { describe, expect, it, vi } from 'vitest';

import { createCommandBus } from './commandBus';
import { clientFail, ok } from './types';
import { ClientErrorItem } from '../types/common';


function clientError(message: string): ClientErrorItem {
	return new ClientErrorItem({ key: 'err.test', message, type: 'validation' });
}

describe('CommandBus.publish', () => {
	it('wraps a handler result in `result` and leaves `error` null', async () => {
		const bus = createCommandBus();
		bus.subscribe('iam.iam_user.search', () => ok({ items: [] }));

		const response = await bus.publish<{ items: unknown[] }>({ name: 'iam.iam_user.search' });

		expect(response.error).toBeNull();
		expect(response.result).toEqual({ data: { items: [] }, clientErrors: [] });
	});

	it('routes client errors to `result.clientErrors`, not `error`', async () => {
		const bus = createCommandBus();
		const errors = [clientError('Email already taken')];
		bus.subscribe('iam.iam_user.create', () => clientFail(errors));

		const response = await bus.publish({ name: 'iam.iam_user.create' });

		expect(response.error).toBeNull();
		expect(response.result?.data).toBeNull();
		expect(response.result?.clientErrors).toEqual(errors);
	});

	it('routes a thrown technical failure to `error` with a null `result`', async () => {
		const bus = createCommandBus();
		const failure = new Error('boom');
		bus.subscribe('iam.iam_user.create', () => { throw failure; });

		const response = await bus.publish({ name: 'iam.iam_user.create' });

		expect(response.error).toBe(failure);
		expect(response.result).toBeNull();
	});

	it('reports an unregistered command as a technical error', async () => {
		const bus = createCommandBus();

		const response = await bus.publish({ name: 'nobody.listens.here' });

		expect(response.error).toBeInstanceOf(Error);
		expect(response.result).toBeNull();
	});

	it('mirrors `result.data` onto the deprecated `data` member', async () => {
		const bus = createCommandBus();
		bus.subscribe('iam.iam_user.get_by_id', () => ok({ id: '1' }));

		const response = await bus.publish<{ id: string }>({ name: 'iam.iam_user.get_by_id' });

		expect(response.data).toEqual({ id: '1' });
	});
});

describe('CommandBus legacy handler compatibility', () => {
	it('normalises a legacy `{data, error: null}` response', async () => {
		const bus = createCommandBus();
		bus.subscribe('legacy.ok', () => ({ data: { id: '1' }, error: null }));

		const response = await bus.publish<{ id: string }>({ name: 'legacy.ok' });

		expect(response.error).toBeNull();
		expect(response.result).toEqual({ data: { id: '1' }, clientErrors: [] });
	});

	it('rethrows a legacy `{data: null, error}` response into `error`', async () => {
		const bus = createCommandBus();
		const failure = new Error('legacy failure');
		bus.subscribe('legacy.fail', () => ({ data: null, error: failure }));

		const response = await bus.publish({ name: 'legacy.fail' });

		expect(response.error).toBe(failure);
		expect(response.result).toBeNull();
	});
});

describe('CommandBus.subscribePrefix', () => {
	it('serves any command under the prefix', async () => {
		const bus = createCommandBus();
		bus.subscribePrefix('core.resource', command => ok(command.name));

		const response = await bus.publish<string>({ name: 'core.resource.warehouse_bin.search' });

		expect(response.result?.data).toBe('core.resource.warehouse_bin.search');
	});

	it('lets an exact handler win over a matching prefix', async () => {
		const bus = createCommandBus();
		bus.subscribePrefix('core.resource', () => ok('prefix'));
		bus.subscribe('core.resource.iam_user.search', () => ok('exact'));

		const response = await bus.publish<string>({ name: 'core.resource.iam_user.search' });

		expect(response.result?.data).toBe('exact');
	});

	it('picks the longest matching prefix', async () => {
		const bus = createCommandBus();
		bus.subscribePrefix('core', () => ok('short'));
		bus.subscribePrefix('core.resource.iam_user', () => ok('long'));

		const response = await bus.publish<string>({ name: 'core.resource.iam_user.search' });

		expect(response.result?.data).toBe('long');
	});

	it('unsubscribes only its own handler', async () => {
		const bus = createCommandBus();
		const unsubscribe = bus.subscribePrefix('core.resource', () => ok('prefix'));

		unsubscribe();
		const response = await bus.publish({ name: 'core.resource.iam_user.search' });

		expect(response.error).toBeInstanceOf(Error);
	});

	it('reports `has` for a prefix-served name', () => {
		const bus = createCommandBus();
		bus.subscribePrefix('core.resource', () => ok(null));

		expect(bus.has('core.resource.anything.search')).toBe(true);
		expect(bus.has('other.command')).toBe(false);
	});
});

describe('CommandBus.subscribe', () => {
	it('unsubscribe is identity-checked so it cannot clobber a newer handler', async () => {
		const bus = createCommandBus();
		const unsubscribeFirst = bus.subscribe('cmd', () => ok('first'));
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		bus.subscribe('cmd', () => ok('second'));

		unsubscribeFirst();
		const response = await bus.publish<string>({ name: 'cmd' });

		expect(response.result?.data).toBe('second');
	});
});
