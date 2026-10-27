import { describe, expect, it } from 'vitest';

import { applyLink, humanizeNodePath, isSiblingNode, MAX_TRAIL_NODES, normalizeTrail } from './trail';

import type { TrailNode } from './trail';


const node = (path: string, extra: Partial<TrailNode> = {}): TrailNode => ({ path, ...extra });
const paths = (trail: TrailNode[]) => trail.map(n => n.path);

describe('isSiblingNode', () => {
	it.each([
		['/inventory/inventory_brand', '/inventory/inventory_brand/B', true],
		['/inventory/inventory_brand/B', '/inventory/inventory_brand', true],
		['/inventory/inventory_brand/B', '/inventory/inventory_brand/C', true],
		['/inventory/inventory_brand/B', '/inventory/inventory_brand/B/', true],
		['/inventory/inventory_brand/B', '/inventory/inventory_product_template/P', false],
		['/inventory/inventory_brand', '/inventory/inventory_brand/B/products', false],
		['/vendingmachine/kiosks/K', '/inventory/inventory_brand', false],
	])('%s → %s is %s', (current, target, expected) => {
		expect(isSiblingNode(current, target)).toBe(expected);
	});
});

describe('applyLink', () => {
	const trail = [node('/inventory/inventory_brand/B', { label: 'Brand B' }), node('/inventory/inventory_product_template/P')];

	it('root starts a new trail', () => {
		expect(paths(applyLink(trail, node('/essential/essential_uom'), 'root'))).toEqual(['/essential/essential_uom']);
	});

	it('sibling replaces a related last node and appends an unrelated one', () => {
		expect(paths(applyLink(trail, node('/inventory/inventory_product_template'), 'sibling')))
			.toEqual(['/inventory/inventory_brand/B', '/inventory/inventory_product_template']);
		expect(paths(applyLink(trail, node('/essential/essential_uom/U'), 'sibling')))
			.toEqual([...paths(trail), '/essential/essential_uom/U']);
	});

	it('append always pushes', () => {
		expect(applyLink(trail, node('/inventory/inventory_product_template/P2'), 'append')).toHaveLength(3);
	});

	it('truncates back to a revisited node and keeps what it knew', () => {
		const result = applyLink(trail, node('/inventory/inventory_brand/B', { search: '?tab=x' }), 'append');
		expect(result).toEqual([{ path: '/inventory/inventory_brand/B', label: 'Brand B', search: '?tab=x', parent: undefined }]);
	});

	it(`caps the trail at ${MAX_TRAIL_NODES} nodes, dropping the oldest`, () => {
		let long: TrailNode[] = [];
		for (let i = 0; i < MAX_TRAIL_NODES + 1; i++) {
			long = applyLink(long, node(`/m${i}/r/${i}`), 'append');
		}
		expect(long).toHaveLength(MAX_TRAIL_NODES);
		expect(long[0].path).toBe('/m1/r/1');
	});
});

describe('normalizeTrail', () => {
	it('collapses a consecutive duplicate', () => {
		expect(paths(normalizeTrail([node('/a/b'), node('/a/b')]))).toEqual(['/a/b']);
	});
});

describe('humanizeNodePath', () => {
	it('names the resource, skipping ids', () => {
		expect(humanizeNodePath('/inventory/inventory_brand/01JABCDEFGHJKMNPQRSTVWXYZ0')).toBe('Inventory Brand');
		expect(humanizeNodePath('/vendingmachine/kiosks')).toBe('Kiosks');
	});
});
