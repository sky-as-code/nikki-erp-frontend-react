import { describe, expect, it } from 'vitest';

import { dropdownScopeGraph, searchGraphOf } from './recordSearchOptions';

import type * as dyn from '@nikkierp/common/dynamicModel';


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

describe('dropdownScopeGraph', () => {
	const locked: dyn.SearchNode = { if: ['warehouse_id', '=', 'W1'] };
	const initial: dyn.SearchNode = { if: ['accept_direct_transfers', '=', true] };

	it('narrows the dropdown by both the locked and the initial graph', () => {
		expect(dropdownScopeGraph({ graph: locked, initialGraph: initial })).toEqual({ and: [locked, initial] });
	});

	it('keeps a lone graph as is, and none without a scope', () => {
		expect(dropdownScopeGraph({ initialGraph: initial })).toBe(initial);
		expect(dropdownScopeGraph({ graph: locked })).toBe(locked);
		expect(dropdownScopeGraph(undefined)).toBeUndefined();
	});
});
