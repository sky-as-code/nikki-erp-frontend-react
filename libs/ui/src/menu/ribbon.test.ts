import { describe, expect, it } from 'vitest';

import { findFirstMenuLink } from './firstMenuLink';
import { isRibbonMenu, menuItemsOf, ribbonToMenuItems } from './ribbon';

import type { MenuContribution, RibbonMenuContribution } from './types';


const RIBBON: RibbonMenuContribution = {
	slug: 'commerce',
	translationNs: 'commerce',
	type: 'ribbon',
	tabs: [
		{ labelKey: 'empty_tab', blocks: [] },
		{
			labelKey: 'sales',
			blocks: [{
				titleKey: 'documents',
				items: [
					{ labelKey: 'orders', link: '/sales_order' },
					{ labelKey: 'billing', items: [{ labelKey: 'bills', link: '/sales_bill' }] },
				],
			}],
		},
	],
};

const TRADITIONAL: MenuContribution = {
	slug: 'iam',
	translationNs: 'iam',
	items: [{ labelKey: 'users', link: '/iam_user' }],
};

describe('ribbon menu helpers', () => {
	it('tells a ribbon from a traditional menu, type omitted', () => {
		expect(isRibbonMenu(RIBBON)).toBe(true);
		expect(isRibbonMenu(TRADITIONAL)).toBe(false);
		expect(isRibbonMenu({ ...TRADITIONAL, type: 'traditional' })).toBe(false);
	});

	it('maps tab, block, item and dropdown link to an item tree', () => {
		expect(ribbonToMenuItems(RIBBON)).toEqual([
			{ labelKey: 'empty_tab', items: [] },
			{
				labelKey: 'sales',
				items: [{
					labelKey: 'documents',
					items: [
						{ labelKey: 'orders', link: '/sales_order' },
						{ labelKey: 'billing', items: [{ labelKey: 'bills', link: '/sales_bill' }] },
					],
				}],
			},
		]);
	});

	it('gives the items of either type', () => {
		expect(menuItemsOf(TRADITIONAL)).toBe(TRADITIONAL.items);
		expect(findFirstMenuLink(menuItemsOf(RIBBON))).toBe('/sales_order');
	});
});
