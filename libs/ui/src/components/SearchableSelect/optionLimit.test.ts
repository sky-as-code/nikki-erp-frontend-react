import { describe, expect, it } from 'vitest';

import { DEFAULT_MAX_OPTIONS, limitOptions, searchPageSize } from './optionLimit';


const items = Array.from({ length: 15 }, (_unused, i) => ({ value: `v${i}`, label: `Item ${i}` }));

describe('limitOptions', () => {
	it('keeps the first maxOptions items', () => {
		expect(limitOptions(items, 3).map(item => item.value)).toEqual(['v0', 'v1', 'v2']);
	});

	it('shows everything for 0 or a short list', () => {
		expect(limitOptions(items, 0)).toHaveLength(15);
		expect(limitOptions(items.slice(0, 2), 10)).toHaveLength(2);
	});

	it('keeps the selected item when it falls past the cut', () => {
		expect(limitOptions(items, 3, 'v12').map(item => item.value)).toEqual(['v0', 'v1', 'v12']);
		expect(limitOptions(items, 3, 'v1').map(item => item.value)).toEqual(['v0', 'v1', 'v2']);
	});
});

describe('searchPageSize', () => {
	it('fetches as many as are shown, 10 by default', () => {
		expect(searchPageSize()).toBe(DEFAULT_MAX_OPTIONS);
		expect(searchPageSize(25)).toBe(25);
	});

	it('asks for the largest page the backend allows when unlimited', () => {
		expect(searchPageSize(0)).toBe(500);
	});
});
