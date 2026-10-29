import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	addMove, buildMovesContribution, emptyMoveDrafts, mapMoveErrors, mergeDraftMoveRows, removeMove, updateMove,
} from './moveDrafts';


function errorAt(field: string): ClientErrorItem {
	return new ClientErrorItem({ field, key: `key:${field}`, message: 'refused', type: 'validation' });
}

describe('transfer move drafts', () => {
	const saved = [
		{ id: 'M1', etag: 'e1', product_variant_id: 'V1', demand_quantity: '2' },
		{ id: 'M2', etag: 'e2', product_variant_id: 'V2', demand_quantity: '5' },
	];

	it('sends nothing until something is drafted', () => {
		expect(buildMovesContribution(emptyMoveDrafts('T1'), 'update')).toBeUndefined();
	});

	it('folds adds, edits and removals into one moves delta, with only the writable fields', () => {
		let drafts = emptyMoveDrafts('T1');
		drafts = addMove(drafts, { product_variant_id: 'V3', demand_quantity: '1', status: 'draft' });
		drafts = updateMove(drafts, { id: 'M1', etag: 'e1', demand_quantity: '3' });
		drafts = removeMove(drafts, saved[1]);

		expect(buildMovesContribution(drafts, 'update')?.payload).toEqual({
			moves: {
				add: [{ product_variant_id: 'V3', demand_quantity: '1' }],
				update: [{ id: 'M1', etag: 'e1', demand_quantity: '3' }],
				remove: ['M2'],
			},
		});
	});

	it('creates with adds only', () => {
		let drafts = addMove(emptyMoveDrafts(''), { product_variant_id: 'V3', demand_quantity: '1', uom_id: '' });
		drafts = updateMove(drafts, { id: 'M1', etag: 'e1', demand_quantity: '3' });

		expect(buildMovesContribution(drafts, 'create')?.payload).toEqual({
			moves: { add: [{ product_variant_id: 'V3', demand_quantity: '1', uom_id: null }] },
		});
	});

	it('edits a draft in place and drops a removed one', () => {
		let drafts = addMove(emptyMoveDrafts('T1'), { product_variant_id: 'V3', demand_quantity: '1' });
		drafts = updateMove(drafts, { id: 'draft:1', etag: 'draft', demand_quantity: '4' });

		expect(drafts.added[0].fields).toEqual({ product_variant_id: 'V3', demand_quantity: '4' });
		expect(removeMove(drafts, { id: 'draft:1' }).added).toEqual([]);
	});

	it('shows saved rows with their edits, without the removed ones, then the drafts', () => {
		let drafts = addMove(emptyMoveDrafts('T1'), { product_variant_id: 'V3', demand_quantity: '1' });
		drafts = updateMove(drafts, { id: 'M1', etag: 'e1', demand_quantity: '9' });
		drafts = removeMove(drafts, saved[1]);

		const rows = mergeDraftMoveRows(saved, drafts);

		expect(rows.map(row => [row.id, row.demand_quantity])).toEqual([['M1', '9'], ['draft:1', '1']]);
	});

	it('pins each moves error on the row it came from', () => {
		const sent = { add: ['draft:1', 'draft:2'], update: ['M1'], remove: [] };
		const errors = mapMoveErrors([
			errorAt('moves.add[1].demand_quantity'), errorAt('moves.update[0].etag'), errorAt('moves'), errorAt('note'),
		], sent);

		expect(Object.keys(errors.byRow)).toEqual(['draft:2', 'M1']);
		expect(errors.general.map(item => item.field)).toEqual(['moves']);
	});
});
