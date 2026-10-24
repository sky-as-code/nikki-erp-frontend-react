import { describe, expect, it } from 'vitest';

import { formatShortcutLabel, matchesShortcut, parseShortcut, toAriaKeyShortcuts } from './parseShortcut';


function keyEvent(init: KeyboardEventInit): KeyboardEvent {
	return { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false, ...init } as KeyboardEvent;
}

describe('parseShortcut', () => {
	it.each([
		['O', { ctrl: false, shift: false, code: 'KeyO' }],
		['o', { ctrl: false, shift: false, code: 'KeyO' }],
		['/', { ctrl: false, shift: false, code: 'Slash' }],
		['Shift+1', { ctrl: false, shift: true, code: 'Digit1' }],
		['Shift+ArrowRight', { ctrl: false, shift: true, code: 'ArrowRight' }],
		['Ctrl+Shift+K', { ctrl: true, shift: true, code: 'KeyK' }],
		['Shift+Ctrl+Enter', { ctrl: true, shift: true, code: 'Enter' }],
		['Escape', { ctrl: false, shift: false, code: 'Escape' }],
	])('parses %s', (spec, expected) => {
		expect(parseShortcut(spec)).toMatchObject(expected);
	});

	it.each([
		'', 'Alt+O', 'Shift+Shift+1', 'Meta+O', 'Ctrl+', 'F1', 'Shift+Ctrl+Shift+A', 'ctrl+A', 'Space',
	])('throws in dev on %j', spec => {
		expect(() => parseShortcut(spec)).toThrow(/Invalid shortcut/);
	});
});

describe('matchesShortcut', () => {
	it('matches on code, not key, so Option-rewritten keys still match', () => {
		const parsed = parseShortcut('O')!;
		expect(matchesShortcut(parsed, keyEvent({ altKey: true, code: 'KeyO', key: 'ø' }))).toBe(true);
		expect(matchesShortcut(parsed, keyEvent({ altKey: true, code: 'KeyP', key: 'o' }))).toBe(false);
	});

	it('matches Shift+Digit whatever the shifted character is', () => {
		const parsed = parseShortcut('Shift+1')!;
		expect(matchesShortcut(parsed, keyEvent({ altKey: true, shiftKey: true, code: 'Digit1', key: '!' }))).toBe(true);
		expect(matchesShortcut(parsed, keyEvent({ altKey: true, shiftKey: true, code: 'Digit1', key: '&' }))).toBe(true);
		expect(matchesShortcut(parsed, keyEvent({ altKey: true, code: 'Digit1', key: '1' }))).toBe(false);
	});

	it('checks every modifier exactly', () => {
		const parsed = parseShortcut('Shift+ArrowRight')!;
		const base = { altKey: true, shiftKey: true, code: 'ArrowRight' };
		expect(matchesShortcut(parsed, keyEvent(base))).toBe(true);
		expect(matchesShortcut(parsed, keyEvent({ ...base, shiftKey: false }))).toBe(false);
		expect(matchesShortcut(parsed, keyEvent({ ...base, ctrlKey: true }))).toBe(false);
		expect(matchesShortcut(parsed, keyEvent({ ...base, metaKey: true }))).toBe(false);
		expect(matchesShortcut(parsed, keyEvent({ ...base, altKey: false }))).toBe(false);
	});
});

describe('labels', () => {
	it.each([
		['Shift+1', '⇧1'],
		['/', '/'],
		['ArrowLeft', '←'],
		['Ctrl+Shift+k', 'Ctrl+⇧K'],
	])('formats %s as %s', (spec, label) => {
		expect(formatShortcutLabel(parseShortcut(spec)!)).toBe(label);
	});

	it('builds aria-keyshortcuts', () => {
		expect(toAriaKeyShortcuts('Shift+1')).toBe('Alt+Shift+1');
		expect(toAriaKeyShortcuts('Ctrl+ArrowLeft')).toBe('Alt+Control+ArrowLeft');
		expect(toAriaKeyShortcuts(undefined)).toBeUndefined();
	});
});
