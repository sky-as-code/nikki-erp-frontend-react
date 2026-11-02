import { describe, expect, it } from 'vitest';

import { buildCrumbs, collapseCrumbs, effectiveNodeLimits } from './buildCrumbs';

import type { Crumb } from './buildCrumbs';


const brands = { path: '/inventory/inventory_brand', label: 'Brands' };
const brandB = { path: '/inventory/inventory_brand/B', label: 'Brand B' };
const product = { path: '/inventory/inventory_product_template/P', label: 'Product P' };
const labels = (crumbs: Crumb[]) => crumbs.map(c => c.label);

describe('buildCrumbs', () => {
	it('expands a lone detail node with its implicit list parent', () => {
		const crumbs = buildCrumbs({ trail: [{ path: brandB.path }], nodePath: brandB.path, lastNodeLabel: 'Brand B', rootParent: brands });
		expect(labels(crumbs)).toEqual(['Brands', 'Brand B']);
		expect(crumbs[0]).toMatchObject({ href: brands.path, isHistoryRoot: true });
		expect(crumbs[1].href).toBeUndefined();
	});

	it('puts the owning record of a nested page before its list parent, both linked as history roots', () => {
		const transfer = { path: '/commerce/inventory_stock_transfer/T1', label: 'Stock Transfer' };
		const moves = { path: '/commerce/inventory_stock_transfer/T1/inventory_stock_move', label: 'Stock Moves', parent: transfer };
		const move = `${moves.path}/M1`;
		const crumbs = buildCrumbs({ trail: [{ path: move }], nodePath: move, lastNodeLabel: 'Coffee', rootParent: moves });

		expect(labels(crumbs)).toEqual(['Stock Transfer', 'Stock Moves', 'Coffee']);
		expect(crumbs.slice(0, 2).map(crumb => [crumb.href, crumb.isHistoryRoot])).toEqual([
			[transfer.path, true], [moves.path, true],
		]);
		expect(labels(buildCrumbs({
			trail: [{ path: moves.path }], nodePath: moves.path, rootParent: transfer, hideLastNode: true,
		}))).toEqual(['Stock Transfer']);
	});

	it('uses the parent stored on the first node when the page is deeper', () => {
		const trail = [{ ...brandB, parent: brands }, product];
		expect(labels(buildCrumbs({ trail, nodePath: product.path }))).toEqual(['Brands', 'Brand B', 'Product P']);
	});

	it('links prefix nodes with their saved search', () => {
		const trail = [{ ...brands, search: '?graph=x' }, { path: '/vendingmachine/kiosks/K' }];
		expect(buildCrumbs({ trail, nodePath: '/vendingmachine/kiosks/K' })[0].href).toBe('/inventory/inventory_brand?graph=x');
	});

	it('hides the last node, leaving nothing on a one-node trail', () => {
		expect(buildCrumbs({ trail: [brands], nodePath: brands.path, hideLastNode: true })).toEqual([]);
	});

	it('gives a split-view list pane the prefix before the record beside it', () => {
		const trail = [{ path: '/vendingmachine/kiosks/K', label: 'Kiosk K' }, brandB];
		expect(labels(buildCrumbs({ trail, nodePath: brands.path, hideLastNode: true }))).toEqual(['Kiosk K']);
	});

	it('falls back to the page alone when the trail does not lead to it', () => {
		expect(buildCrumbs({ trail: [product], nodePath: brands.path, lastNodeLabel: 'Brands' })).toHaveLength(1);
		expect(buildCrumbs({ trail: null, nodePath: brands.path })).toHaveLength(1);
	});
});

describe('node limits', () => {
	it('falls back to 5 below 2 and uses 2 when compact', () => {
		expect(effectiveNodeLimits(undefined, false)).toBe(5);
		expect(effectiveNodeLimits(1, false)).toBe(5);
		expect(effectiveNodeLimits(3, false)).toBe(3);
		expect(effectiveNodeLimits(8, true)).toBe(2);
	});

	it('counts (...) as one of the displayed items', () => {
		const crumbs = ['a', 'b', 'c', 'd', 'e', 'f'].map(key => ({ key }));
		const { collapsed, shown } = collapseCrumbs(crumbs, 5);
		expect(collapsed.map(c => c.key)).toEqual(['a', 'b']);
		expect(shown.map(c => c.key)).toEqual(['c', 'd', 'e', 'f']);
	});

	it('keeps only the last crumb beside (...) at the compact limit', () => {
		const crumbs = ['a', 'b', 'c'].map(key => ({ key }));
		expect(collapseCrumbs(crumbs, 2).shown.map(c => c.key)).toEqual(['c']);
	});

	it('collapses nothing while the crumbs fit', () => {
		const crumbs = ['a', 'b', 'c', 'd', 'e'].map(key => ({ key }));
		expect(collapseCrumbs(crumbs, 5).collapsed).toEqual([]);
	});
});
