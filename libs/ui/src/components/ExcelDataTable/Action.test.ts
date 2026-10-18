import { ClientErrorItem } from '@nikkierp/common/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getActionStateProps, isActionVisible, publishActionCommand } from './Action';


const notice = vi.hoisted(() => ({
	notifyClientErrors: vi.fn(),
	showShellNotice: vi.fn(() => Promise.resolve('id')),
}));
vi.mock('@nikkierp/common/service', () => notice);


describe('isActionVisible', () => {
	// Selecting rows swaps the bar rather than adding to it: Refresh and Create have nothing to do
	// with a pending selection, so they step aside for the actions that act on it.
	it('shows a table-level action only while nothing is selected', () => {
		expect(isActionVisible(undefined, 0)).toBe(true);
		expect(isActionVisible(undefined, 1)).toBe(false);
		expect(isActionVisible(undefined, 3)).toBe(false);
	});

	it('shows a single-selection action for exactly one row', () => {
		expect(isActionVisible('single', 0)).toBe(false);
		expect(isActionVisible('single', 1)).toBe(true);
		expect(isActionVisible('single', 2)).toBe(false);
	});

	it('shows a multiple-selection action for one or more rows', () => {
		expect(isActionVisible('multiple', 0)).toBe(false);
		expect(isActionVisible('multiple', 1)).toBe(true);
		expect(isActionVisible('multiple', 5)).toBe(true);
	});
});

describe('getActionStateProps', () => {
	it('keeps the icon and stays enabled when idle', () => {
		const props = getActionStateProps({ icon: 'icon' });
		expect(props.leftSection).toBe('icon');
		expect(props.disabled).toBe(false);
		expect(props).not.toHaveProperty('c');
	});

	it('swaps the icon for a spinner and disables the control while loading', () => {
		const props = getActionStateProps({ icon: 'icon', loading: true });
		expect(props.leftSection).not.toBe('icon');
		expect(props.disabled).toBe(true);
		expect(props['aria-busy']).toBe(true);
	});

	it('greys a dimmed action without disabling it, so the click still answers', () => {
		const props = getActionStateProps({ dimmed: true });
		expect(props.disabled).toBe(false);
		expect(props).toMatchObject({ color: 'gray', c: 'dimmed', 'data-dimmed': 'true' });
	});
});

describe('publishActionCommand', () => {
	const t = vi.fn((key: string) => `t(${key})`);
	const inUse = new ClientErrorItem({ key: 'common:err_resource_in_use', message: 'In use', type: 'business' });

	function busReturning(response: unknown) {
		return { publish: vi.fn(() => Promise.resolve(response)) } as never;
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	it('publishes the ids and refreshes without a notice on success', async () => {
		const publish = vi.fn(() => Promise.resolve({ result: { data: null, clientErrors: [] }, error: null }));
		const refresh = vi.fn();
		await publishActionCommand({ publish } as never, 'iam.iam_role.delete_many', ['1', '2'], t, refresh);
		expect(publish).toHaveBeenCalledWith({ name: 'iam.iam_role.delete_many', payload: { ids: ['1', '2'] } });
		expect(notice.notifyClientErrors).toHaveBeenCalledWith(t, []);
		expect(notice.showShellNotice).not.toHaveBeenCalled();
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('publishes client errors to the Shell Notice and still refreshes', async () => {
		const bus = busReturning({ result: { data: null, clientErrors: [inUse] }, error: null });
		const refresh = vi.fn();
		await publishActionCommand(bus, 'cmd', ['1'], t, refresh);
		expect(notice.notifyClientErrors).toHaveBeenCalledWith(t, [inUse]);
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('shows one generic notice for a technical error and still refreshes', async () => {
		const bus = busReturning({ result: null, error: new Error('<boom>') });
		const refresh = vi.fn();
		await publishActionCommand(bus, 'cmd', ['1'], t, refresh);
		expect(notice.notifyClientErrors).not.toHaveBeenCalled();
		expect(notice.showShellNotice).toHaveBeenCalledWith('error', 't(common:datatable.actionFailed)');
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('treats a rejected publish as a technical error', async () => {
		const bus = { publish: vi.fn(() => Promise.reject(new Error('down'))) } as never;
		const refresh = vi.fn();
		await publishActionCommand(bus, 'cmd', ['1'], t, refresh);
		expect(notice.showShellNotice).toHaveBeenCalledOnce();
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('escapes the generic notice text', async () => {
		const bus = busReturning({ result: null, error: new Error('x') });
		await publishActionCommand(bus, 'cmd', [], () => '<b>failed</b>', vi.fn());
		expect(notice.showShellNotice).toHaveBeenCalledWith('error', '&lt;b&gt;failed&lt;/b&gt;');
	});
});
