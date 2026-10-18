import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createShellNoticeStore, INFO_TIMEOUT_MS } from './shellNoticeStore';


describe('Shell Notice store', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('keeps info and error in separate stacks, newest last', () => {
		const store = createShellNoticeStore();
		store.push('info', 'a');
		store.push('error', 'b');
		store.push('info', 'c');

		expect(store.getSnapshot().info.map(notice => notice.html)).toEqual(['a', 'c']);
		expect(store.getSnapshot().error.map(notice => notice.html)).toEqual(['b']);
	});

	it('auto-dismisses info after the timeout but never errors', () => {
		const store = createShellNoticeStore();
		store.push('info', 'a');
		store.push('error', 'b');

		vi.advanceTimersByTime(INFO_TIMEOUT_MS - 1);
		expect(store.getSnapshot().info).toHaveLength(1);

		vi.advanceTimersByTime(1);
		expect(store.getSnapshot().info).toHaveLength(0);

		vi.advanceTimersByTime(INFO_TIMEOUT_MS * 10);
		expect(store.getSnapshot().error).toHaveLength(1);
	});

	it('continues the remaining time after a pause instead of restarting', () => {
		const store = createShellNoticeStore();
		store.push('info', 'a');

		vi.advanceTimersByTime(6_000);
		store.pauseInfo();
		vi.advanceTimersByTime(60_000);
		expect(store.getSnapshot().info).toHaveLength(1);

		store.resumeInfo();
		vi.advanceTimersByTime(3_999);
		expect(store.getSnapshot().info).toHaveLength(1);
		vi.advanceTimersByTime(1);
		expect(store.getSnapshot().info).toHaveLength(0);
	});

	it('starts an info pushed during a pause as paused', () => {
		const store = createShellNoticeStore();
		store.pauseInfo();
		store.push('info', 'a');

		vi.advanceTimersByTime(INFO_TIMEOUT_MS * 2);
		expect(store.getSnapshot().info).toHaveLength(1);

		store.resumeInfo();
		vi.advanceTimersByTime(INFO_TIMEOUT_MS);
		expect(store.getSnapshot().info).toHaveLength(0);
	});

	it('dismisses by id, idempotently, and notifies listeners only on change', () => {
		const store = createShellNoticeStore();
		const listener = vi.fn();
		store.subscribe(listener);
		const id = store.push('error', 'a');
		listener.mockClear();

		store.dismiss(id);
		store.dismiss(id);
		expect(store.getSnapshot().error).toHaveLength(0);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('drops the oldest notices past the cap and stops their timers', () => {
		const store = createShellNoticeStore({ stackCap: 2 });
		const listener = vi.fn();
		store.push('info', 'a');
		store.push('info', 'b');
		store.push('info', 'c');
		expect(store.getSnapshot().info.map(notice => notice.html)).toEqual(['b', 'c']);

		store.subscribe(listener);
		vi.advanceTimersByTime(INFO_TIMEOUT_MS);
		expect(store.getSnapshot().info).toHaveLength(0);
		// Two timer-driven dismissals; the dropped notice's timer must not fire a third.
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('clears everything and cancels pending timers', () => {
		const store = createShellNoticeStore();
		store.push('info', 'a');
		store.push('error', 'b');
		store.clear();

		expect(store.getSnapshot()).toEqual({ info: [], error: [] });
		expect(vi.getTimerCount()).toBe(0);
	});
});
