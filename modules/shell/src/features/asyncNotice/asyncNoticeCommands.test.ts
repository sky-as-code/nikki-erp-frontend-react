import { CommandBus } from '@nikkierp/common/commandBus';
import { describe, expect, it } from 'vitest';

import { ASYNC_NOTICE_COMMANDS, registerAsyncNoticeCommands } from './asyncNoticeCommands';
import { createAsyncNoticeStore } from './asyncNoticeStore';


function setup() {
	const bus = new CommandBus();
	const store = createAsyncNoticeStore();
	const unsubscribe = registerAsyncNoticeCommands(bus, store);
	return { bus, store, unsubscribe };
}

describe('shell.async_notice.notify', () => {
	it('pushes the notice and returns its id', async () => {
		const { bus, store, unsubscribe } = setup();

		const response = await bus.publish<{ id: string }>({
			name: ASYNC_NOTICE_COMMANDS.NOTIFY,
			payload: { type: 'error', html: '<b>Import failed</b>' },
		});

		const [notice] = store.getSnapshot().error;
		expect(response.error).toBeNull();
		expect(response.result?.data?.id).toBe(notice.id);
		expect(notice.html).toBe('<b>Import failed</b>');
		unsubscribe();
	});

	it.each([
		[undefined],
		[{ html: 'x' }],
		[{ type: 'warning', html: 'x' }],
		[{ type: 'info', html: '   ' }],
	])('rejects malformed payload %j as a technical error', async payload => {
		const { bus, store, unsubscribe } = setup();

		const response = await bus.publish({ name: ASYNC_NOTICE_COMMANDS.NOTIFY, payload });

		expect(response.error).toBeInstanceOf(Error);
		expect(store.getSnapshot()).toEqual({ info: [], error: [] });
		unsubscribe();
	});

	it('clears the store on teardown', async () => {
		const { bus, store, unsubscribe } = setup();
		await bus.publish({ name: ASYNC_NOTICE_COMMANDS.NOTIFY, payload: { type: 'info', html: 'x' } });

		unsubscribe();
		expect(store.getSnapshot().info).toHaveLength(0);
		expect(bus.has(ASYNC_NOTICE_COMMANDS.NOTIFY)).toBe(false);
	});
});
