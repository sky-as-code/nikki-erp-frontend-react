import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	addMove, buildMovesContribution, emptyMoveDrafts, isEditedMoveRow, mapMoveErrors, mergeDraftMoveRows, removeMove,
	updateMove, withTemplateRule,
} from './moveDrafts';


function errorAt(field: string): ClientErrorItem {
	return new ClientErrorItem({ field, key: `key:${field}`, message: 'refused', type: 'validation' });
}

const RED = { product_attribute_id: 'COLOR', product_attribute_value_id: 'RED' };
const BLUE = { product_attribute_id: 'COLOR', product_attribute_value_id: 'BLUE' };

describe('transfer move drafts', () => {
	const saved = [
		{ id: 'M1', etag: 'e1', product_template_id: 'T1', attributes: [RED], demand_quantity: '2', uom_id: 'U1' },
		{ id: 'M2', etag: 'e2', product_template_id: 'T2', attributes: [], demand_quantity: '5', uom_id: null },
	];

	it('sends nothing until something is drafted', () => {
		expect(buildMovesContribution(emptyMoveDrafts('T1'), 'update')).toBeUndefined();
	});

	it('adds a group in the template form, with only the move fields', () => {
		const drafts = addMove(emptyMoveDrafts(''), {
			product_template_id: 'T3', demand_quantity: '1', uom_id: '', status: 'draft',
			attributes: [{ ...RED, product_attribute: { name: 'Color' } }],
		});

		expect(buildMovesContribution(drafts, 'create')?.payload).toEqual({
			moves: { add: [{ product_template_id: 'T3', attributes: [RED], demand_quantity: '1' }] },
		});
	});

	it('updates only the demand when the template and attributes are unchanged', () => {
		const drafts = updateMove(emptyMoveDrafts('X'), { ...saved[0], demand_quantity: '3' }, saved[0]);

		expect(buildMovesContribution(drafts, 'update')?.payload.moves.update).toEqual([
			{ id: 'M1', etag: 'e1', demand_quantity: '3' },
		]);
	});

	it('sends the template form when an attribute changed, and skips a group edited back', () => {
		let drafts = updateMove(emptyMoveDrafts('X'), { ...saved[0], attributes: [BLUE] }, saved[0]);
		drafts = updateMove(drafts, { ...saved[1], demand_quantity: '6' }, saved[1]);
		drafts = updateMove(drafts, { ...saved[1], demand_quantity: '5' }, saved[1]);

		expect(buildMovesContribution(drafts, 'update')).toEqual({
			payload: { moves: { update: [{ id: 'M1', etag: 'e1', product_template_id: 'T1', attributes: [BLUE] }] } },
			sent: { add: [], update: ['M1'], remove: [] },
		});
	});

	it('drops the attributes of a group whose template changed', () => {
		const values = withTemplateRule({ ...saved[0], product_template_id: 'T9' }, saved[0]);
		const drafts = updateMove(emptyMoveDrafts('X'), values, saved[0]);

		expect(values.attributes).toEqual([]);
		expect(buildMovesContribution(drafts, 'update')?.payload.moves.update).toEqual([
			{ id: 'M1', etag: 'e1', product_template_id: 'T9', attributes: [] },
		]);
		expect(withTemplateRule({ ...saved[0], demand_quantity: '1' }, saved[0]).attributes).toEqual([RED]);
	});

	it('removes saved groups, drops removed drafts, and creates with adds only', () => {
		let drafts = addMove(emptyMoveDrafts('X'), { product_template_id: 'T3', demand_quantity: '1' });
		drafts = removeMove(drafts, saved[1]);
		drafts = updateMove(drafts, { ...saved[0], demand_quantity: '9' }, saved[0]);

		expect(buildMovesContribution(drafts, 'update')?.payload.moves.remove).toEqual(['M2']);
		expect(buildMovesContribution(drafts, 'create')?.payload.moves).toEqual({
			add: [{ product_template_id: 'T3', attributes: [], demand_quantity: '1' }],
		});
		expect(removeMove(drafts, { id: 'draft:1' }).added).toEqual([]);
	});

	it('shows saved groups with their edits, without the removed ones, then the drafts', () => {
		let drafts = addMove(emptyMoveDrafts('X'), { product_template_id: 'T3', demand_quantity: '1' });
		drafts = updateMove(drafts, { ...saved[0], demand_quantity: '9' }, saved[0]);
		drafts = removeMove(drafts, saved[1]);

		const rows = mergeDraftMoveRows(saved, drafts);

		expect(rows.map(row => [row.id, row.demand_quantity])).toEqual([['M1', '9'], ['draft:1', '1']]);
		expect(rows[1]).toMatchObject({ attributes: [], $draft: true, etag: 'draft' });
		expect(isEditedMoveRow({ id: 'M1:0', __row_span_group: 'M1' }, drafts)).toBe(true);
	});

	it('pins each moves error, nested attribute paths included, on the group it came from', () => {
		const sent = { add: ['draft:1', 'draft:2'], update: ['M1'], remove: [] };
		const errors = mapMoveErrors([
			errorAt('moves.add[1].attributes[0].product_attribute_value_id'), errorAt('moves.update[0].etag'),
			errorAt('moves'), errorAt('note'),
		], sent);

		expect(Object.keys(errors.byRow)).toEqual(['draft:2', 'M1']);
		expect(errors.general.map(item => item.field)).toEqual(['moves']);
	});
});
