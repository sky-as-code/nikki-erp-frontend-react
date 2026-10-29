import { afterEach, describe, expect, it, vi } from 'vitest';

import { CLIENT_ERROR_MODAL_TOPIC, notifyClientErrors, showClientErrorModal, showShellNotice } from './shellNotice';
import { CommandBus } from '../commandBus';
import { ClientErrorItem } from '../types';

import type { ICommandBus } from '../commandBus';
import type { IEventBus } from '../eventBus';


function installBus(response: unknown): ReturnType<typeof vi.fn> {
	const publish = vi.fn(async () => response);
	CommandBus.instance = { publish } as unknown as ICommandBus;
	return publish;
}

describe('showShellNotice', () => {
	afterEach(() => {
		CommandBus.instance = undefined;
	});

	it('publishes the Shell command and returns the notice id', async () => {
		const publish = installBus({ result: { data: { id: 'n-1' }, clientErrors: [] }, error: null });

		await expect(showShellNotice('error', '<b>Failed</b>')).resolves.toBe('n-1');
		expect(publish).toHaveBeenCalledWith({
			name: 'shell.shell_notice.notify',
			payload: { type: 'error', html: '<b>Failed</b>' },
		});
	});

	it('rethrows a technical failure from the Shell', async () => {
		const failure = new Error('bad payload');
		installBus({ result: null, error: failure });

		await expect(showShellNotice('info', 'x')).rejects.toBe(failure);
	});

	it('throws when no bus is installed', async () => {
		await expect(showShellNotice('info', 'x')).rejects.toThrow(/CommandBus is not initialized/);
	});
});

describe('notifyClientErrors', () => {
	afterEach(() => {
		CommandBus.instance = undefined;
	});

	const translate = (key: string, options: Record<string, unknown>) => `${key}|${String(options.name ?? '')}`;

	function item(type: 'business' | 'authorization', vars?: Record<string, unknown>): ClientErrorItem {
		return new ClientErrorItem({ key: 'common:err_x', message: 'm', type, vars });
	}

	it('publishes each error translated and escaped', () => {
		const publish = installBus({ result: { data: { id: 'n-1' }, clientErrors: [] }, error: null });

		notifyClientErrors(translate, [item('business', { name: '<b>' }), item('business')]);

		expect(publish).toHaveBeenCalledTimes(2);
		expect(publish).toHaveBeenNthCalledWith(1, {
			name: 'shell.shell_notice.notify',
			payload: { type: 'error', html: 'common:err_x|&lt;b&gt;' },
		});
	});

	it('skips authorization errors', () => {
		const publish = installBus({ result: { data: { id: 'n-1' }, clientErrors: [] }, error: null });

		notifyClientErrors(translate, [item('authorization')]);

		expect(publish).not.toHaveBeenCalled();
	});

	it('logs instead of throwing when the notice fails', async () => {
		const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(() => notifyClientErrors(translate, [item('business')])).not.toThrow();
		await vi.waitFor(() => expect(logged).toHaveBeenCalled());
		logged.mockRestore();
	});
});

describe('showClientErrorModal', () => {
	const translate = vi.fn((key: string) => `T(${key})`);
	const errorItem = (type: string, key: string) => new ClientErrorItem({ type, key, message: 'fallback' });

	function eventBus(): { bus: IEventBus, publish: ReturnType<typeof vi.fn> } {
		const publish = vi.fn();
		return { bus: { publish } as unknown as IEventBus, publish };
	}

	it('publishes the translated messages, skipping authorization errors', () => {
		const { bus, publish } = eventBus();
		showClientErrorModal(translate, [errorItem('business', 'a:x'), errorItem('authorization', 'a:y')], bus);
		expect(publish).toHaveBeenCalledWith(CLIENT_ERROR_MODAL_TOPIC, { messages: ['T(a:x)'] });
	});

	it('publishes nothing when no message is left', () => {
		const { bus, publish } = eventBus();
		showClientErrorModal(translate, [errorItem('authorization', 'a:y')], bus);
		showClientErrorModal(translate, [], bus);
		expect(publish).not.toHaveBeenCalled();
	});
});
