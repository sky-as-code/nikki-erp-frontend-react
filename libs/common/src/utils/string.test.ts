import { describe, expect, it } from 'vitest';

import { capitalizeWords, escapeHtml } from './string';


describe('escapeHtml', () => {
	it('escapes every character that can open markup or break out of an attribute', () => {
		expect(escapeHtml(`<a href="x" title='y'>A & B</a>`))
			.toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;A &amp; B&lt;/a&gt;');
	});

	it('escapes the ampersand first so existing entities are not double-decoded', () => {
		expect(escapeHtml('&lt;')).toBe('&amp;lt;');
	});

	it('leaves plain text untouched', () => {
		expect(escapeHtml('Không có đối tượng nào được chọn')).toBe('Không có đối tượng nào được chọn');
	});
});

describe('capitalizeWords', () => {
	it('upper-cases the first letter of every word, like CSS text-transform: capitalize', () => {
		expect(capitalizeWords('inventory brand')).toBe('Inventory Brand');
		expect(capitalizeWords('đơn vị tính')).toBe('Đơn Vị Tính');
	});

	it('leaves letters after the first and already capitalised words untouched', () => {
		expect(capitalizeWords('UoM conversions')).toBe('UoM Conversions');
		expect(capitalizeWords('')).toBe('');
	});
});
