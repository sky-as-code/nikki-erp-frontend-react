import { afterEach, describe, expect, it, vi } from 'vitest';

import { showAsyncNotice } from './asyncNotice';
import { CommandBus } from '../commandBus';

import type { ICommandBus } from '../commandBus';


function installBus(response: unknown): ReturnType<typeof vi.fn> {
	const publish = vi.fn(async () => response);
	CommandBus.instance = { publish } as unknown as ICommandBus;
	return publish;
}

describe('showAsyncNotice', () => {
	afterEach(() => {
		CommandBus.instance = undefined;
	});

	it('publishes the Shell command and returns the notice id', async () => {
		const publish = installBus({ result: { data: { id: 'n-1' }, clientErrors: [] }, error: null });

		await expect(showAsyncNotice('error', '<b>Failed</b>')).resolves.toBe('n-1');
		expect(publish).toHaveBeenCalledWith({
			name: 'shell.async_notice.notify',
			payload: { type: 'error', html: '<b>Failed</b>' },
		});
	});

	it('rethrows a technical failure from the Shell', async () => {
		const failure = new Error('bad payload');
		installBus({ result: null, error: failure });

		await expect(showAsyncNotice('info', 'x')).rejects.toBe(failure);
	});

	it('throws when no bus is installed', async () => {
		await expect(showAsyncNotice('info', 'x')).rejects.toThrow(/CommandBus is not initialized/);
	});
});
