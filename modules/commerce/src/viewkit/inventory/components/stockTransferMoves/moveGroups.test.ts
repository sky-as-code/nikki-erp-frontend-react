import { describe, expect, it } from 'vitest';

import {
	groupSavedMoves, MOVE_EDGE_LABELS, MOVE_GROUP_COLUMNS, MOVE_GROUP_SCHEMA, MOVE_VARIANT_SEARCH_SCOPE,
	unlabelledVariantIds, withVariantLabels,
} from './moveGroups';


const moves = [
	{
		id: 'M2', etag: 'e2', sequence: 20, product_variant_id: 'V2', uom_id: 'U1', demand_quantity: '1',
		product_variant: { display_name: 'Shirt (L)' }, uom: { name: 'Unit' },
	},
	{
		id: 'M1', etag: 'e1', sequence: 10, product_variant_id: 'V1', uom_id: null, demand_quantity: '20',
		product_variant: { display_name: 'Shirt (M)' },
	},
];

describe('saved moves as rows', () => {
	it('keeps one row per move, in sequence order, with its labelled variant and unit', () => {
		const rows = groupSavedMoves(moves);

		expect(rows.map(row => [row.id, row.product_variant_id, row.demand_quantity])).toEqual([
			['M1', 'V1', '20'], ['M2', 'V2', '1'],
		]);
		expect(rows[1]).toMatchObject({ product_variant: { display_name: 'Shirt (L)' }, uom: { name: 'Unit' } });
	});

	it('is a flat table: Product variant, Demand quantity, Unit', () => {
		expect(MOVE_GROUP_COLUMNS).toEqual(['product_variant_id', 'demand_quantity', 'uom_id']);
		expect(MOVE_GROUP_SCHEMA.fields.product_variant_id.label).toEqual({ $ref: 'fields.product_variant_id' });
		expect(MOVE_GROUP_SCHEMA.fields.uom_id.label).toEqual({ $ref: 'fields.uom_name' });
		expect(MOVE_GROUP_SCHEMA.fields).not.toHaveProperty('product_template_id');
		expect(MOVE_GROUP_SCHEMA.fields).not.toHaveProperty('attributes');
		expect(MOVE_EDGE_LABELS.product_variant).toBe('display_name');
	});

	it('offers only transaction-eligible variants', () => {
		expect(MOVE_VARIANT_SEARCH_SCOPE.product_variant_id.graph).toEqual({
			if: ['is_transaction_eligible', '=', true],
		});
	});
});

describe('variant labels of unread rows', () => {
	const rows = [
		...groupSavedMoves(moves),
		{ id: 'draft:1', product_variant_id: 'V3', demand_quantity: '2' },
		{ id: 'draft:2', product_variant_id: 'V3', demand_quantity: '4' },
		{ id: 'draft:3', demand_quantity: '1' },
	];

	it('asks for the variants no read labelled, once each', () => {
		expect(unlabelledVariantIds(rows)).toEqual(['V3']);
	});

	it('puts a looked-up name where the read cell looks for it', () => {
		const labelled = withVariantLabels(rows, new Map([['V3', 'Cap']]));

		expect(labelled[2].product_variant).toEqual({ display_name: 'Cap' });
		expect(labelled[0].product_variant).toEqual({ display_name: 'Shirt (M)' });
		expect(labelled[4]).not.toHaveProperty('product_variant');
	});
});
