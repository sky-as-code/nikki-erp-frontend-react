import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	addMove, buildMovesContribution, emptyMoveDrafts, isEditedMoveRow, mapMoveErrors, mergeDraftMoveRows, removeMove,
	updateMove,
} from './moveDrafts';


function errorAt(field: string): ClientErrorItem {
	return new ClientErrorItem({ field, key: `key:${field}`, message: 'refused', type: 'validation' });
}

describe('transfer move drafts', () => {
	const saved = [
		{
			id: 'M1', etag: 'e1', product_variant_id: 'V1', demand_quantity: '2', uom_id: 'U1',
			product_variant: { display_name: 'Shirt (M)' },
		},
		{ id: 'M2', etag: 'e2', product_variant_id: 'V2', demand_quantity: '5', uom_id: null },
	];

	it('sends nothing until something is drafted', () => {
		expect(buildMovesContribution(emptyMoveDrafts('T1'), 'update')).toBeUndefined();
	});

	it('adds a move by its variant, with only the move fields', () => {
		const drafts = addMove(emptyMoveDrafts(''), {
			product_variant_id: 'V3', demand_quantity: '1', uom_id: '', status: 'draft',
		});

		expect(buildMovesContribution(drafts, 'create')?.payload).toEqual({
			moves: { add: [{ product_variant_id: 'V3', demand_quantity: '1' }] },
		});
	});

	it('keeps a picked unit on the added move', () => {
		const drafts = addMove(emptyMoveDrafts(''), { product_variant_id: 'V3', demand_quantity: '1', uom_id: 'U2' });

		expect(buildMovesContribution(drafts, 'create')?.payload.moves.add).toEqual([
			{ product_variant_id: 'V3', demand_quantity: '1', uom_id: 'U2' },
		]);
	});

	it('updates only the demand when the variant is unchanged', () => {
		const drafts = updateMove(emptyMoveDrafts('X'), { ...saved[0], demand_quantity: '3' }, saved[0]);

		expect(buildMovesContribution(drafts, 'update')?.payload.moves.update).toEqual([
			{ id: 'M1', etag: 'e1', demand_quantity: '3' },
		]);
	});

	it('sends the variant when it changed, and skips a move edited back', () => {
		let drafts = updateMove(emptyMoveDrafts('X'), { ...saved[0], product_variant_id: 'V9' }, saved[0]);
		drafts = updateMove(drafts, { ...saved[1], demand_quantity: '6' }, saved[1]);
		drafts = updateMove(drafts, { ...saved[1], demand_quantity: '5' }, saved[1]);

		expect(buildMovesContribution(drafts, 'update')).toEqual({
			payload: { moves: { update: [{ id: 'M1', etag: 'e1', product_variant_id: 'V9' }] } },
			sent: { add: [], update: ['M1'], remove: [] },
		});
	});

	it('drops the read label of a saved move given another variant', () => {
		const drafts = updateMove(emptyMoveDrafts('X'), { ...saved[0], product_variant_id: 'V9' }, saved[0]);
		const [row] = mergeDraftMoveRows(saved, drafts);

		expect(row.product_variant_id).toBe('V9');
		expect(row).not.toHaveProperty('product_variant');
	});

	it('removes saved moves, drops removed drafts, and creates with adds only', () => {
		let drafts = addMove(emptyMoveDrafts('X'), { product_variant_id: 'V3', demand_quantity: '1' });
		drafts = removeMove(drafts, saved[1]);
		drafts = updateMove(drafts, { ...saved[0], demand_quantity: '9' }, saved[0]);

		expect(buildMovesContribution(drafts, 'update')?.payload.moves.remove).toEqual(['M2']);
		expect(buildMovesContribution(drafts, 'create')?.payload.moves).toEqual({
			add: [{ product_variant_id: 'V3', demand_quantity: '1' }],
		});
		expect(removeMove(drafts, { id: 'draft:1' }).added).toEqual([]);
	});

	it('shows saved moves with their edits, without the removed ones, then the drafts', () => {
		let drafts = addMove(emptyMoveDrafts('X'), { product_variant_id: 'V3', demand_quantity: '1' });
		drafts = updateMove(drafts, { ...saved[0], demand_quantity: '9' }, saved[0]);
		drafts = removeMove(drafts, saved[1]);

		const rows = mergeDraftMoveRows(saved, drafts);

		expect(rows.map(row => [row.id, row.demand_quantity])).toEqual([['M1', '9'], ['draft:1', '1']]);
		expect(rows[0].product_variant).toEqual({ display_name: 'Shirt (M)' });
		expect(rows[1]).toMatchObject({ product_variant_id: 'V3', $draft: true, etag: 'draft' });
		expect(isEditedMoveRow({ id: 'M1' }, drafts)).toBe(true);
		expect(isEditedMoveRow({ id: 'draft:1' }, drafts)).toBe(false);
	});

	it('pins each moves error on the move it came from', () => {
		const sent = { add: ['draft:1', 'draft:2'], update: ['M1'], remove: [] };
		const errors = mapMoveErrors([
			errorAt('moves.add[1].product_variant_id'), errorAt('moves.update[0].etag'),
			errorAt('moves'), errorAt('note'),
		], sent);

		expect(Object.keys(errors.byRow)).toEqual(['draft:2', 'M1']);
		expect(errors.general.map(item => item.field)).toEqual(['moves']);
	});
});
