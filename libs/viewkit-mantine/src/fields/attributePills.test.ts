import { describe, expect, it } from 'vitest';

import { attributePillsSpecSchema, attributePillText, toAttributePairs } from './attributePills';


describe('attributePillsSpecSchema', () => {
	it('defaults the separator', () => {
		expect(attributePillsSpecSchema.parse({ renderer: 'attributePills' }).separator).toBe(':');
	});

	it('rejects an unknown key', () => {
		expect(() => attributePillsSpecSchema.parse({ renderer: 'attributePills', colorMap: {} })).toThrow();
	});
});

describe('toAttributePairs', () => {
	it('reads a list of name/value objects', () => {
		const raw = [{ name: 'Sugar', value: 'No sugar' }, { name: 'Size', value: 'Big' }];
		expect(toAttributePairs(raw)).toEqual(raw);
	});

	it('accepts the alternative key spellings the backend may use', () => {
		const raw = [{ attribute: 'Size', attribute_value: 'Big' }];
		expect(toAttributePairs(raw)).toEqual([{ name: 'Size', value: 'Big' }]);
	});

	it('keeps a bare value that has no attribute to qualify it', () => {
		expect(toAttributePairs(['Red'])).toEqual([{ value: 'Red' }]);
	});

	// A record with no attributes should look like every other absent value in the table, which is
	// a blank cell rather than an empty pill.
	it('is empty for an absent value', () => {
		expect(toAttributePairs([])).toEqual([]);
		expect(toAttributePairs(null)).toEqual([]);
		expect(toAttributePairs(undefined)).toEqual([]);
		expect(toAttributePairs('')).toEqual([]);
	});

	it('drops entries carrying neither a name nor a value', () => {
		expect(toAttributePairs([{ name: 'Size', value: 'Big' }, {}, null, ''])).toEqual([
			{ name: 'Size', value: 'Big' },
		]);
	});

	// The column may be pointed at a scalar summary; one pill reading `[object Object]` is the
	// failure this renderer exists to avoid, and a plain string is legible as-is.
	it('accepts a single non-array value', () => {
		expect(toAttributePairs('Red')).toEqual([{ value: 'Red' }]);
	});
});

describe('attributePillText', () => {
	it('names the attribute beside its value', () => {
		expect(attributePillText({ name: 'Sugar', value: 'No sugar' }, ':')).toBe('Sugar: No sugar');
	});

	it('honours a configured separator', () => {
		expect(attributePillText({ name: 'Size', value: 'Big' }, ' =')).toBe('Size = Big');
	});

	it('shows the value alone when there is no name', () => {
		expect(attributePillText({ value: 'Red' }, ':')).toBe('Red');
	});

	it('leaves no trailing separator when the value is missing', () => {
		expect(attributePillText({ name: 'Size' }, ':')).toBe('Size:');
	});
});
