import { describe, expect, it } from 'vitest';

import { buildClipboardPayload, rowsFromSelection } from './clipboard';

import type { SearchData } from './types';


const data = {
	items: [{ id: 'a', name: 'A', qty: 1 }, { id: 'b', name: 'B', qty: 2 }, { id: 'c', name: 'C', qty: 3 }],
	desired_fields: ['name', 'qty'],
	masked_fields: [],
} as unknown as SearchData;

describe('rowsFromSelection', () => {
	it('returns the selected rows in display order regardless of selection order', () => {
		expect(rowsFromSelection(data, ['a', 'b', 'c'], ['c', 'a'])).toEqual([['A', '1'], ['C', '3']]);
	});

	it('is empty with nothing selected', () => {
		expect(rowsFromSelection(data, ['a', 'b', 'c'], [])).toEqual([]);
	});
});

describe('buildClipboardPayload', () => {
	it('tab-separates plain text and escapes html', () => {
		const payload = buildClipboardPayload([['a<b', '1'], ['c', '2']]);
		expect(payload.plainText).toBe('a<b\t1\nc\t2');
		expect(payload.htmlText).toBe('<table><tbody><tr><td>a&lt;b</td><td>1</td></tr><tr><td>c</td><td>2</td></tr></tbody></table>');
	});
});
