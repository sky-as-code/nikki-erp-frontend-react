import { describe, expect, it } from 'vitest';

import { rowKeyIntent } from './rowKeys';

import type { RowKeyInput } from './rowKeys';


function keyIn(overrides: Partial<RowKeyInput>): RowKeyInput {
	return { key: 'Enter', defaultPrevented: false, insideRow: true, isTextarea: false, isPopupOpen: false, ...overrides };
}

describe('rowKeyIntent', () => {
	it('confirms on Enter in any input of the row', () => {
		expect(rowKeyIntent(keyIn({}))).toBe('confirm');
	});

	it('discards on Escape', () => {
		expect(rowKeyIntent(keyIn({ key: 'Escape' }))).toBe('discard');
	});

	it('leaves Enter alone where it already means something', () => {
		expect(rowKeyIntent(keyIn({ isTextarea: true }))).toBeNull();
		expect(rowKeyIntent(keyIn({ isPopupOpen: true }))).toBeNull();
		expect(rowKeyIntent(keyIn({ defaultPrevented: true }))).toBeNull();
	});

	it('ignores keys from outside the row, such as a portalled dropdown', () => {
		expect(rowKeyIntent(keyIn({ insideRow: false }))).toBeNull();
		expect(rowKeyIntent(keyIn({ key: 'Escape', insideRow: false }))).toBeNull();
	});

	it('ignores other keys', () => {
		expect(rowKeyIntent(keyIn({ key: 'a' }))).toBeNull();
	});
});
