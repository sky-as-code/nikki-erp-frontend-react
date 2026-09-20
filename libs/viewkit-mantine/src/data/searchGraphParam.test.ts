import { describe, expect, it, vi } from 'vitest';

import { isSearchGraphShape, parseSearchGraphParam } from './searchGraphParam';


describe('parseSearchGraphParam', () => {
	it('reads nothing from an absent or empty parameter', () => {
		expect(parseSearchGraphParam(null)).toBeUndefined();
		expect(parseSearchGraphParam(undefined)).toBeUndefined();
		expect(parseSearchGraphParam('')).toBeUndefined();
	});

	it('reads a single condition', () => {
		expect(parseSearchGraphParam('{"if":["email","$",".com"]}')).toEqual({ if: ['email', '$', '.com'] });
	});

	it('reads a nested graph with its order', () => {
		const raw = '{"and":[{"if":["a","=","1"]},{"if":["b","=","2"]}],"order":[["a","asc"]]}';
		expect(parseSearchGraphParam(raw)).toEqual({
			and: [{ if: ['a', '=', '1'] }, { if: ['b', '=', '2'] }],
			order: [['a', 'asc']],
		});
	});
});

describe('parseSearchGraphParam: rejected input', () => {
	it('drops malformed JSON instead of throwing', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		expect(parseSearchGraphParam('{')).toBeUndefined();
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it.each(['"x"', '[1,2]', 'null', '5', '{}', '{"foo":1}'])('drops %s', raw => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		expect(parseSearchGraphParam(raw)).toBeUndefined();
		warn.mockRestore();
	});

	it('drops a node carrying two branches, which the backend refuses', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		expect(parseSearchGraphParam('{"if":["a","=","1"],"and":[]}')).toBeUndefined();
		warn.mockRestore();
	});
});

describe('isSearchGraphShape', () => {
	it('accepts each single-branch form, with or without an order', () => {
		expect(isSearchGraphShape({ if: ['a', '=', '1'] })).toBe(true);
		expect(isSearchGraphShape({ and: [] })).toBe(true);
		expect(isSearchGraphShape({ or: [], order: [['a', 'asc']] })).toBe(true);
	});

	it('rejects anything that is not a single-branch graph object', () => {
		expect(isSearchGraphShape([])).toBe(false);
		expect(isSearchGraphShape(null)).toBe(false);
		expect(isSearchGraphShape({})).toBe(false);
		expect(isSearchGraphShape({ if: ['a'], or: [] })).toBe(false);
	});
});
