// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { isPopupEnterForRow, readRowKey, rowKeyIntent } from './rowKeys';

import type { RowKeyInput } from './rowKeys';
import type React from 'react';


function keyIn(overrides: Partial<RowKeyInput>): RowKeyInput {
	return { key: 'Enter', defaultPrevented: false, insideRow: true, isTextarea: false, isPopupOpen: false,
		isOptionHighlighted: false, ...overrides };
}

describe('rowKeyIntent', () => {
	it('confirms on Enter in any input of the row', () => {
		expect(rowKeyIntent(keyIn({}))).toBe('confirm');
	});

	it('discards on Escape', () => {
		expect(rowKeyIntent(keyIn({ key: 'Escape' }))).toBe('discard');
	});

	it('leaves Escape to an open dropdown, which closes on it', () => {
		expect(rowKeyIntent(keyIn({ key: 'Escape', isPopupOpen: true }))).toBeNull();
	});

	it('leaves Enter alone where it already means something', () => {
		expect(rowKeyIntent(keyIn({ isTextarea: true }))).toBeNull();
		expect(rowKeyIntent(keyIn({ isPopupOpen: true, isOptionHighlighted: true }))).toBeNull();
		expect(rowKeyIntent(keyIn({ defaultPrevented: true }))).toBeNull();
	});

	it('confirms on Enter in an open dropdown with no option highlighted, e.g. a MultiSelect after a pick', () => {
		expect(rowKeyIntent(keyIn({ isPopupOpen: true }))).toBe('confirm');
	});

	it('ignores keys from outside the row, such as a portalled dropdown', () => {
		expect(rowKeyIntent(keyIn({ insideRow: false }))).toBeNull();
		expect(rowKeyIntent(keyIn({ key: 'Escape', insideRow: false }))).toBeNull();
	});

	it('ignores other keys', () => {
		expect(rowKeyIntent(keyIn({ key: 'a' }))).toBeNull();
	});
});

function enterOn(attrs: Record<string, string>): React.KeyboardEvent<HTMLElement> {
	const row = document.createElement('tr');
	const input = document.createElement('input');
	Object.entries(attrs).forEach(([name, value]) => input.setAttribute(name, value));
	row.appendChild(input);
	return {
		key: 'Enter', target: input, currentTarget: row, defaultPrevented: false, nativeEvent: { isComposing: false },
	} as never;
}

describe('readRowKey', () => {
	function openTrigger(listHtml: string): React.KeyboardEvent<HTMLElement> {
		document.body.innerHTML = `<div id='list'>${listHtml}</div>`;
		return enterOn({ 'aria-haspopup': 'listbox', 'data-expanded': 'true', 'aria-controls': 'list' });
	}

	it('leaves Enter to an open dropdown whose list has a highlighted option', () => {
		const event = openTrigger("<div data-combobox-option data-combobox-selected='true'></div>");
		expect(readRowKey(event)).toBeNull();
	});

	it('confirms on Enter in an open dropdown with nothing highlighted, a checked option included', () => {
		const event = openTrigger("<div data-combobox-option aria-selected='true' data-checked='true'></div>");
		expect(readRowKey(event)).toBe('confirm');
	});
});

describe('isPopupEnterForRow', () => {
	it('claims Enter on a closed dropdown trigger', () => {
		expect(isPopupEnterForRow(enterOn({ 'aria-haspopup': 'listbox', 'aria-expanded': 'false' }))).toBe(true);
	});

	it('leaves Enter to the highlighted option of an open dropdown, even one whose aria-expanded lags', () => {
		document.body.innerHTML = "<div id='list'><div data-combobox-option data-combobox-selected='true'></div></div>";
		const open = { 'aria-haspopup': 'listbox', 'aria-expanded': 'true', 'aria-controls': 'list' };
		expect(isPopupEnterForRow(enterOn(open))).toBe(false);
		const lagging = { ...open, 'aria-expanded': 'false', 'data-expanded': 'true' };
		expect(isPopupEnterForRow(enterOn(lagging))).toBe(false);
	});

	it('claims Enter on an open dropdown with nothing highlighted', () => {
		document.body.innerHTML = "<div id='list'><div data-combobox-option></div></div>";
		const open = { 'aria-haspopup': 'listbox', 'data-expanded': 'true', 'aria-controls': 'list' };
		expect(isPopupEnterForRow(enterOn(open))).toBe(true);
	});

	it('ignores inputs that are not dropdown triggers', () => {
		expect(isPopupEnterForRow(enterOn({}))).toBe(false);
	});
});
