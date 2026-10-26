import { describe, expect, it } from 'vitest';

import { findActiveRibbonTab, groupRibbonColumns, pickRibbonLayout } from './ribbonLayout';

import type { RibbonTab } from '@nikkierp/ui/menu';


describe('groupRibbonColumns', () => {
	it.each([
		[0, []],
		[3, [[0, 1, 2]]],
		[4, [[0, 1, 2], [3]]],
		[7, [[0, 1, 2], [3, 4, 5], [6]]],
	])('stacks %i items in columns of three', (count, expected) => {
		expect(groupRibbonColumns(Array.from({ length: count }, (_unused, index) => index))).toEqual(expected);
	});

	it('honours another row count', () => {
		expect(groupRibbonColumns(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']]);
	});
});

describe('pickRibbonLayout', () => {
	it('keeps the full ribbon while it fits, boundary included', () => {
		expect(pickRibbonLayout(600, 600)).toBe('full');
		expect(pickRibbonLayout(400, 600)).toBe('full');
	});

	it('collapses once it does not', () => {
		expect(pickRibbonLayout(601, 600)).toBe('collapsed');
	});
});

describe('findActiveRibbonTab', () => {
	const tabs: RibbonTab[] = [
		{ labelKey: 'empty', blocks: [] },
		{ labelKey: 'stock', blocks: [{ titleKey: 'b', items: [{ labelKey: 'q', link: '/stock_quant' }] }] },
		{
			labelKey: 'sales',
			blocks: [
				{ titleKey: 'none', items: [] },
				{ titleKey: 'b', items: [{ labelKey: 'billing', items: [{ labelKey: 'bill', link: '/sales_bill' }] }] },
			],
		},
	];

	it('finds the tab of a leaf link', () => {
		expect(findActiveRibbonTab(tabs, '/commerce/stock_quant', '/commerce')).toBe(1);
	});

	it('finds the tab of a dropdown link, on a detail sub-path too', () => {
		expect(findActiveRibbonTab(tabs, '/commerce/sales_bill/01H', '/commerce')).toBe(2);
	});

	it('answers -1 when no tab holds the route', () => {
		expect(findActiveRibbonTab(tabs, '/commerce/elsewhere', '/commerce')).toBe(-1);
	});
});
