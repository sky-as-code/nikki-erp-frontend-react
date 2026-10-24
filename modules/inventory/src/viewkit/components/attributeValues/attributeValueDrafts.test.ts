import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	addValue, buildValuesContribution, draftsFor, emptyDrafts, hasDrafts, isDraftRow, isEditedRow, mapValueErrors,
	mergeDraftRows, pickValueFields, removeValue, updateValue,
} from './attributeValueDrafts';


const RED = { code: 'red', name: { 'en-US': 'Red' }, sequence: 1, color_hex: '#FF0000' };
const SAVED = [
	{ id: 'v1', etag: 'e1', code: 'navy', name: { 'en-US': 'Navy' } },
	{ id: 'v2', etag: 'e2', code: 'teal', name: { 'en-US': 'Teal' } },
];

function errorAt(field: string): ClientErrorItem {
	return new ClientErrorItem({ field, key: 'inventory:product_attribute_value.name_duplicate', message: 'dup', type: 'validation' });
}

describe('attribute value drafts', () => {
	it('keeps only the fields a delta row may carry, and sends a cleared colour as null', () => {
		expect(pickValueFields({ ...RED, is_archived: true, attribute_id: 'a', color_hex: '' }))
			.toEqual({ code: 'red', name: { 'en-US': 'Red' }, sequence: 1, color_hex: null });
	});

	it('sends adds only on create', () => {
		let drafts = addValue(emptyDrafts(''), RED);
		drafts = removeValue(drafts, SAVED[0]);

		expect(buildValuesContribution(drafts, 'create')?.payload).toEqual({ values: { add: [RED] } });
	});

	it('sends nothing while there is no draft', () => {
		expect(buildValuesContribution(emptyDrafts('a1'), 'update')).toBeUndefined();
		expect(hasDrafts(emptyDrafts('a1'))).toBe(false);
	});

	it('builds the add, update and remove lists of an update, with ids and etags', () => {
		let drafts = addValue(emptyDrafts('a1'), RED);
		drafts = updateValue(drafts, { id: 'v1', etag: 'e1', name: { 'en-US': 'Navy blue' } });
		drafts = updateValue(drafts, { id: 'v1', etag: 'e1', sequence: 4 });
		drafts = removeValue(drafts, SAVED[1]);

		expect(buildValuesContribution(drafts, 'update')).toEqual({
			payload: {
				values: {
					add: [RED],
					update: [{ id: 'v1', etag: 'e1', name: { 'en-US': 'Navy blue' }, sequence: 4 }],
					remove: ['v2'],
				},
			},
			sent: { add: ['draft:1'], update: ['v1'], remove: ['v2'] },
		});
	});

});

describe('attribute value row edits', () => {
	it('edits a draft in place and drops it on delete', () => {
		let drafts = addValue(emptyDrafts('a1'), RED);
		drafts = updateValue(drafts, { id: 'draft:1', etag: 'draft', code: 'crimson' });

		expect(drafts.added[0].fields.code).toBe('crimson');
		expect(removeValue(drafts, { id: 'draft:1' }).added).toEqual([]);
	});

	it('records a saved removal once, and forgets the edits of a removed value', () => {
		let drafts = updateValue(emptyDrafts('a1'), { id: 'v1', etag: 'e1', code: 'x' });
		drafts = removeValue(drafts, SAVED[0]);

		expect(drafts.updated).toEqual([]);
		expect(updateValue(drafts, { id: 'v1', etag: 'e1', code: 'y' })).toBe(drafts);
		expect(removeValue(drafts, SAVED[0])).toBe(drafts);
		expect(drafts.removed).toEqual(['v1']);
	});

	it('hides removed values and shows saved rows with their edits, then the drafts', () => {
		let drafts = addValue(emptyDrafts('a1'), RED);
		drafts = updateValue(drafts, { id: 'v1', etag: 'e1', code: 'navy2' });
		drafts = removeValue(drafts, SAVED[1]);
		const rows = mergeDraftRows(SAVED, drafts);

		expect(rows.map(row => row.code)).toEqual(['navy2', 'red']);
		expect(isDraftRow(rows[1])).toBe(true);
		expect(rows[1]).toMatchObject({ id: 'draft:1', etag: 'draft', is_archived: false });
	});

	it('brings a removed value back once the drafts are discarded', () => {
		const drafts = removeValue(emptyDrafts('a1'), SAVED[1]);

		expect(mergeDraftRows(SAVED, emptyDrafts('a1')).map(row => row.id)).toEqual(['v1', 'v2']);
		expect(mergeDraftRows(SAVED, drafts).map(row => row.id)).toEqual(['v1']);
	});

	it('marks a saved row with a drafted edit as changed, never a draft', () => {
		let drafts = addValue(emptyDrafts('a1'), RED);
		drafts = updateValue(drafts, { id: 'v1', etag: 'e1', code: 'navy2' });
		const rows = mergeDraftRows(SAVED, drafts);

		expect(rows.map(row => isEditedRow(row, drafts))).toEqual([true, false, false]);
	});

	it('discards the drafts of another attribute', () => {
		const drafts = addValue(emptyDrafts('a1'), RED);

		expect(draftsFor(drafts, 'a2')).toEqual(emptyDrafts('a2'));
		expect(draftsFor(drafts, 'a1')).toBe(drafts);
	});
});

describe('mapValueErrors', () => {
	const sent = { add: ['draft:1', 'draft:2'], update: ['v1'], remove: ['v2'] };

	it('pins each row error on the row it came from', () => {
		const errors = mapValueErrors([
			errorAt('values.add[1].name'), errorAt('values.update[0].id'), errorAt('values.remove[0]'),
		], sent);

		expect(Object.keys(errors.byRow)).toEqual(['draft:2', 'v1', 'v2']);
		expect(errors.general).toEqual([]);
	});

	it('keeps list-level errors general and ignores errors of the attribute itself', () => {
		const errors = mapValueErrors([errorAt('values'), errorAt('values.add[9].name'), errorAt('code')], sent);

		expect(errors.byRow).toEqual({});
		expect(errors.general.map(item => item.field)).toEqual(['values', 'values.add[9].name']);
	});
});
