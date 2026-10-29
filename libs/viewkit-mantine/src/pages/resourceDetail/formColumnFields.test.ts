import { describe, expect, it } from 'vitest';

import { columnFieldNames, inlineRowFieldNames, parseInlineRowItem } from './formColumnFields';


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
	it('flattens inline rows to their @@ fields, in order', () => {
		const fields = ['code', ['$$form.parent', '@@parent_id', 'in', '@@warehouse_id'], 'name'];

		expect(columnFieldNames(fields)).toEqual(['code', 'parent_id', 'warehouse_id', 'name']);
	});

	it('gives nothing for a missing list or a text-only row', () => {
		expect(columnFieldNames(undefined)).toEqual([]);
		expect(columnFieldNames([['$$hint', 'text']])).toEqual([]);
	});

	it('names the fields of one row', () => {
		expect(inlineRowFieldNames(['@@a', '$$b', '@@c'])).toEqual(['a', 'c']);
	});
});
