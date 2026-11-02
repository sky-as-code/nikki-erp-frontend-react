import { describe, expect, it } from 'vitest';

import {
	columnFieldNames, groupItemsOf, inlineRowFieldNames, isFieldGroupDisplay, parseInlineRowItem,
} from './formColumnFields';


describe('parseInlineRowItem', () => {
	it('reads $$ns:key as a key in that namespace', () => {
		expect(parseInlineRowItem('$$common:action.refresh')).toEqual({ kind: 'text', ns: 'common', key: 'action.refresh' });
	});

	it('reads $$key as a key in the page namespace', () => {
		expect(parseInlineRowItem('$$parent_location')).toEqual({ kind: 'text', key: 'parent_location' });
	});

	it('reads @@field as a field', () => {
		expect(parseInlineRowItem('@@display_name')).toEqual({ kind: 'field', name: 'display_name' });
	});

	it('keeps anything else as literal text', () => {
		expect(parseInlineRowItem('of')).toEqual({ kind: 'literal', text: 'of' });
		expect(parseInlineRowItem('$x')).toEqual({ kind: 'literal', text: '$x' });
	});
});

describe('columnFieldNames', () => {
	it('flattens field groups to their @@ fields, in order', () => {
		const fields = ['code', { fields: ['$$form.parent', '@@parent_id', 'in', '@@warehouse_id'] }, 'name'];

		expect(columnFieldNames(fields)).toEqual(['code', 'parent_id', 'warehouse_id', 'name']);
	});

	it('gives nothing for a missing list, a text-only group or a bare array', () => {
		expect(columnFieldNames(undefined)).toEqual([]);
		expect(columnFieldNames([{ fields: ['$$hint', 'text'] }])).toEqual([]);
		expect(columnFieldNames([['@@a']])).toEqual([]);
	});

	it('names the fields of one row', () => {
		expect(inlineRowFieldNames(['@@a', '$$b', '@@c'])).toEqual(['a', 'c']);
	});
});

describe('field group displays', () => {
	const price = { label: 'fields.list_price', fields: ['@@list_price', '$$common:per', '@@uom_id'] };

	it('flattens an object to the @@ fields of its row', () => {
		expect(columnFieldNames(['name', price])).toEqual(['name', 'list_price', 'uom_id']);
	});

	it('names a field shown more than once only once', () => {
		const cost = { label: 'fields.cost', fields: ['@@cost', '$$common:per', '@@uom_id'] };
		expect(columnFieldNames([price, cost, 'uom_id'])).toEqual(['list_price', 'uom_id', 'cost']);
	});

	it('tells a group from a name or a bare array', () => {
		expect([price, 'name', ['@@a']].map(isFieldGroupDisplay)).toEqual([true, false, false]);
	});

	it('gives each field item the width at its own index', () => {
		const sized = { fields: ['@@list_price', '$$common:per', '@@uom_id'], widths: ['8rem', null] };

		expect(groupItemsOf(sized)).toEqual([
			{ kind: 'field', name: 'list_price', width: '8rem' },
			{ kind: 'text', ns: 'common', key: 'per' },
			{ kind: 'field', name: 'uom_id' },
		]);
	});
});
