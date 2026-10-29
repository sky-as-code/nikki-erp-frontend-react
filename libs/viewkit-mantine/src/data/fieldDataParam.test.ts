import { describe, expect, it, vi } from 'vitest';

import { parseFieldDataParam, pickSchemaFieldValues } from './fieldDataParam';

import type * as dyn from '@nikkierp/common/dynamicModel';


describe('parseFieldDataParam', () => {
	it('reads nothing from an absent parameter', () => {
		expect(parseFieldDataParam(null)).toBeUndefined();
		expect(parseFieldDataParam(undefined)).toBeUndefined();
		expect(parseFieldDataParam('')).toBeUndefined();
	});

	it('parses a JSON object', () => {
		expect(parseFieldDataParam('{"operation_code":"incoming","qty":2}')).toEqual({ operation_code: 'incoming', qty: 2 });
	});

	it('round-trips through the URL encoding a link uses', () => {
		const search = new URLSearchParams(`field_data=${encodeURIComponent('{"name":"A & B"}')}`);
		expect(parseFieldDataParam(search.get('field_data'))).toEqual({ name: 'A & B' });
	});

	it('warns and drops malformed JSON and non-objects', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		expect(parseFieldDataParam('{')).toBeUndefined();
		expect(parseFieldDataParam('[1]')).toBeUndefined();
		expect(parseFieldDataParam('"x"')).toBeUndefined();
		expect(parseFieldDataParam('null')).toBeUndefined();
		expect(warn).toHaveBeenCalledTimes(4);
		warn.mockRestore();
	});
});

describe('pickSchemaFieldValues', () => {
	const modelSchema = { fields: { name: {}, operation_code: {} } } as unknown as dyn.ModelSchema;

	it('ignores keys that are not fields of the model', () => {
		expect(pickSchemaFieldValues({ name: 'A', bogus: 1, toString: 'x' }, modelSchema)).toEqual({ name: 'A' });
	});

	it('gives nothing when no key is a field', () => {
		expect(pickSchemaFieldValues({ bogus: 1 }, modelSchema)).toBeUndefined();
		expect(pickSchemaFieldValues(undefined, modelSchema)).toBeUndefined();
	});
});
