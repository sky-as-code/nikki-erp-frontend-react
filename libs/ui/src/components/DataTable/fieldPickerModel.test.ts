import { describe, expect, it } from 'vitest';

import {
	addFields, canMoveDown, canMoveUp, moveFieldsDown, moveFieldsUp, removeFields, sortAvailable,
} from './fieldPickerModel';


const compare = (a: string, b: string) => a.localeCompare(b);

describe('addFields', () => {
	it('appends to the end, so a newly shown column lands last', () => {
		expect(addFields(['a', 'b'], ['c'])).toEqual(['a', 'b', 'c']);
	});

	it('keeps the order the fields were chosen in', () => {
		expect(addFields([], ['c', 'a'])).toEqual(['c', 'a']);
	});

	it('never duplicates a field that is already displayed', () => {
		expect(addFields(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
	});
});

describe('removeFields', () => {
	it('drops the chosen fields and leaves the rest in order', () => {
		expect(removeFields(['a', 'b', 'c'], ['b'])).toEqual(['a', 'c']);
	});

	it('ignores a field that is not displayed', () => {
		expect(removeFields(['a'], ['zz'])).toEqual(['a']);
	});
});

describe('moveFieldsUp', () => {
	it('moves a single field one place towards the front', () => {
		expect(moveFieldsUp(['a', 'b', 'c'], ['c'])).toEqual(['a', 'c', 'b']);
	});

	it('refuses to move a field already at the top', () => {
		expect(moveFieldsUp(['a', 'b'], ['a'])).toEqual(['a', 'b']);
	});

	it('moves a multi-selection as a block, preserving its internal order', () => {
		expect(moveFieldsUp(['a', 'b', 'c', 'd'], ['c', 'd'])).toEqual(['a', 'c', 'd', 'b']);
	});

	it('holds a block pinned to the top still, rather than shuffling the rest past it', () => {
		expect(moveFieldsUp(['a', 'b', 'c'], ['a', 'b'])).toEqual(['a', 'b', 'c']);
	});

	it('moves a non-contiguous selection, each field independently', () => {
		expect(moveFieldsUp(['a', 'b', 'c', 'd'], ['b', 'd'])).toEqual(['b', 'a', 'd', 'c']);
	});
});

describe('moveFieldsDown', () => {
	it('moves a single field one place towards the end', () => {
		expect(moveFieldsDown(['a', 'b', 'c'], ['a'])).toEqual(['b', 'a', 'c']);
	});

	it('refuses to move a field already at the bottom', () => {
		expect(moveFieldsDown(['a', 'b'], ['b'])).toEqual(['a', 'b']);
	});

	it('moves a multi-selection as a block, preserving its internal order', () => {
		expect(moveFieldsDown(['a', 'b', 'c', 'd'], ['a', 'b'])).toEqual(['c', 'a', 'b', 'd']);
	});

	it('is the exact inverse of moving the same block back up', () => {
		const moved = moveFieldsDown(['a', 'b', 'c', 'd'], ['a', 'b']);
		expect(moveFieldsUp(moved, ['a', 'b'])).toEqual(['a', 'b', 'c', 'd']);
	});
});

describe('canMoveUp / canMoveDown', () => {
	it('are false with nothing selected', () => {
		expect(canMoveUp(['a', 'b'], [])).toBe(false);
		expect(canMoveDown(['a', 'b'], [])).toBe(false);
	});

	it('are false at the ends they cannot leave', () => {
		expect(canMoveUp(['a', 'b'], ['a'])).toBe(false);
		expect(canMoveDown(['a', 'b'], ['b'])).toBe(false);
	});

	it('are true when the move would change the order', () => {
		expect(canMoveUp(['a', 'b'], ['b'])).toBe(true);
		expect(canMoveDown(['a', 'b'], ['a'])).toBe(true);
	});
});

describe('sortAvailable', () => {
	it('orders by the localized label, not the field name', () => {
		const label = (field: string) => ({ zulu: 'Alpha', alpha: 'Zulu' }[field] ?? field);
		expect(sortAvailable(['alpha', 'zulu'], label, compare)).toEqual(['zulu', 'alpha']);
	});

	it('leaves the input array untouched', () => {
		const input = ['b', 'a'];
		sortAvailable(input, f => f, compare);
		expect(input).toEqual(['b', 'a']);
	});
});
