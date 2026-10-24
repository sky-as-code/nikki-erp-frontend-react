// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createShortcutRegistry, SHORTCUTS_VISIBLE_ATTRIBUTE } from './registry';
import { addButton, press, pressAlt, stubLayout } from './shortcutTestHarness';

import type { ShortcutRegistry } from './registry';


let restoreLayout: () => void;
let registry: ShortcutRegistry;

beforeAll(() => {
	restoreLayout = stubLayout();
});
afterAll(() => restoreLayout());
beforeEach(() => {
	registry = createShortcutRegistry(window);
});
afterEach(() => {
	registry.dispose();
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

const isVisible = () => document.documentElement.hasAttribute(SHORTCUTS_VISIBLE_ATTRIBUTE);

describe('running a shortcut', () => {
	it('clicks in click mode and only focuses in focus mode', () => {
		const button = addButton('Save');
		const input = document.createElement('input');
		document.body.appendChild(input);
		const onClick = vi.fn();
		button.addEventListener('click', onClick);
		registry.register(button, 'S');
		registry.register(input, '/', { mode: 'focus' });

		expect(press('keydown', { key: 's', code: 'KeyS' })).toBe(true);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(press('keydown', { key: '/', code: 'Slash' })).toBe(true);
		expect(document.activeElement).toBe(input);
	});

	it('matches Shift+Digit and Shift+Arrow by code', () => {
		const first = addButton('First');
		const next = addButton('Next');
		const onFirst = vi.fn();
		const onNext = vi.fn();
		first.addEventListener('click', onFirst);
		next.addEventListener('click', onNext);
		registry.register(first, 'Shift+1');
		registry.register(next, 'Shift+ArrowRight');

		press('keydown', { key: '!', code: 'Digit1', shift: true });
		press('keydown', { key: 'ArrowRight', code: 'ArrowRight', shift: true });
		expect(onFirst).toHaveBeenCalledTimes(1);
		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it('leaves unmatched keys alone, so the browser keeps Alt+ArrowLeft', () => {
		registry.register(addButton('Save'), 'S');
		expect(press('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' })).toBe(false);
		expect(press('keydown', { key: 's', code: 'KeyS', shift: true })).toBe(false);
	});

	it('ignores auto-repeat but still swallows it', () => {
		const button = addButton('Save');
		const onClick = vi.fn();
		button.addEventListener('click', onClick);
		registry.register(button, 'S');
		const event = new KeyboardEvent('keydown', {
			key: 's', code: 'KeyS', altKey: true, repeat: true, bubbles: true, cancelable: true,
		});
		document.body.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
		expect(onClick).not.toHaveBeenCalled();
	});
});

describe('disabled targets', () => {
	it('skips a disabled target but swallows the key', () => {
		const button = addButton('Prev');
		const onClick = vi.fn();
		button.addEventListener('click', onClick);
		const handle = registry.register(button, 'ArrowLeft', { disabled: true })!;

		expect(press('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' })).toBe(true);
		expect(onClick).not.toHaveBeenCalled();
		handle.update({ disabled: false });
		press('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('treats the native disabled attribute and aria-disabled as disabled', () => {
		const native = addButton('A');
		native.disabled = true;
		const aria = addButton('B');
		aria.setAttribute('aria-disabled', 'true');
		const onClick = vi.fn();
		aria.addEventListener('click', onClick);
		registry.register(native, 'A');
		registry.register(aria, 'B');

		expect(press('keydown', { key: 'a', code: 'KeyA' })).toBe(true);
		press('keydown', { key: 'b', code: 'KeyB' });
		expect(onClick).not.toHaveBeenCalled();
	});
});

describe('conflicts', () => {
	it('runs the latest registered visible element and warns', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const older = addButton('Older');
		const newer = addButton('Newer');
		const onOlder = vi.fn();
		const onNewer = vi.fn();
		older.addEventListener('click', onOlder);
		newer.addEventListener('click', onNewer);
		registry.register(older, 'O');
		registry.register(newer, 'O');

		press('keydown', { key: 'o', code: 'KeyO' });
		expect(onNewer).toHaveBeenCalledTimes(1);
		expect(onOlder).not.toHaveBeenCalled();
		expect(warn).toHaveBeenCalled();
	});

	it('falls back to an older element when the newer one is hidden', () => {
		const older = addButton('Older');
		const newer = addButton('Newer');
		newer.setAttribute('data-test-hidden', '');
		const onOlder = vi.fn();
		older.addEventListener('click', onOlder);
		registry.register(older, 'O');
		registry.register(newer, 'O');

		press('keydown', { key: 'o', code: 'KeyO' });
		expect(onOlder).toHaveBeenCalledTimes(1);
	});

	it('drops a target once unregistered', () => {
		const button = addButton('Save');
		const handle = registry.register(button, 'S')!;
		handle.unregister();
		expect(press('keydown', { key: 's', code: 'KeyS' })).toBe(false);
	});
});

describe('visibility', () => {
	it('shows on Alt down and hides on Alt up', () => {
		registry.register(addButton('Save'), 'S');
		const listener = vi.fn();
		registry.subscribe(listener);

		pressAlt('keydown');
		expect(isVisible()).toBe(true);
		expect(registry.getSnapshot().visible).toBe(true);
		expect(pressAlt('keyup')).toBe(true);
		expect(isVisible()).toBe(false);
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('hides on window blur and when the page is hidden', () => {
		registry.subscribe(() => undefined);
		pressAlt('keydown');
		window.dispatchEvent(new Event('blur'));
		expect(isVisible()).toBe(false);

		pressAlt('keydown');
		vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
		document.dispatchEvent(new Event('visibilitychange'));
		expect(isVisible()).toBe(false);
	});

	it('hides when a key arrives without Alt (the Alt keyup was missed)', () => {
		registry.subscribe(() => undefined);
		pressAlt('keydown');
		press('keydown', { key: 'a', code: 'KeyA', alt: false });
		expect(isVisible()).toBe(false);
	});

	it('does not cancel a bare Alt release when nothing is registered', () => {
		registry.subscribe(() => undefined);
		pressAlt('keydown');
		expect(pressAlt('keyup')).toBe(false);
	});

	it('lists only shown, non-zero-size targets', () => {
		const shown = addButton('Shown');
		const hidden = addButton('Hidden');
		hidden.setAttribute('data-test-hidden', '');
		const zero = addButton('Zero');
		zero.setAttribute('data-test-zero-size', '');
		const wrapper = document.createElement('div');
		wrapper.setAttribute('aria-hidden', 'true');
		const measure = addButton('Measure');
		wrapper.appendChild(measure);
		document.body.appendChild(wrapper);
		[shown, hidden, zero, measure].forEach((element, index) => registry.register(element, String(index)));
		const detached = document.createElement('button');
		registry.register(detached, '9');

		expect(registry.getActiveEntries().map(entry => entry.element)).toEqual([shown]);
	});
});
