import { describe, expect, it } from 'vitest';

import { searchGraphOf } from './recordSearchOptions';


describe('searchGraphOf', () => {
	it('matches the typed term on the search field', () => {
		expect(searchGraphOf('ab', 'name', undefined)).toEqual({ if: ['name', '*', 'ab'] });
	});

	it('sends no graph with neither a term nor a scope', () => {
		expect(searchGraphOf('', 'name', undefined)).toBeUndefined();
	});

	it('never searches an id by its text', () => {
		expect(searchGraphOf('ab', 'id', undefined)).toBeUndefined();
	});

	it('keeps the scope alone with no term, and ANDs it with one', () => {
		const scope = { if: ['operation_code', '=', 'incoming'] as ['operation_code', '=', string] };

		expect(searchGraphOf('', 'name', scope)).toEqual(scope);
		expect(searchGraphOf('re', 'name', scope)).toEqual({ and: [{ if: ['name', '*', 're'] }, scope] });
	});
});
