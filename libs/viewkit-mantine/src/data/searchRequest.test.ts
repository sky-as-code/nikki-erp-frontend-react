import { describe, expect, it } from 'vitest';

import { isSameSearchRequest } from './searchRequest';

import type * as dyn from '@nikkierp/common/dynamicModel';


const BASE: dyn.RestSearchRequest = { page: 0, size: 50, search_name: 'default' };


describe('isSameSearchRequest', () => {
	it('treats an unchanged request as the same', () => {
		expect(isSameSearchRequest(BASE, { ...BASE })).toBe(true);
	});

	it('notices paging and sizing changes', () => {
		expect(isSameSearchRequest(BASE, { ...BASE, page: 1 })).toBe(false);
		expect(isSameSearchRequest(BASE, { ...BASE, size: 100 })).toBe(false);
	});

	it('compares the graph by identity, as the caller rebuilds it on every change', () => {
		const graph: dyn.SearchGraph = { if: ['name', '*', 'x'] };
		expect(isSameSearchRequest({ ...BASE, graph }, { ...BASE, graph })).toBe(true);
		expect(isSameSearchRequest({ ...BASE, graph }, { ...BASE, graph: { ...graph } })).toBe(false);
	});

	it('notices the archived toggle', () => {
		// Regression: with no other filter the graph stays undefined and every other field
		// matches, so omitting this comparison made toggling "include archived" a no-op —
		// the request was judged identical and never republished.
		expect(isSameSearchRequest(BASE, { ...BASE, include_archived: true })).toBe(false);
		expect(isSameSearchRequest({ ...BASE, include_archived: true }, BASE)).toBe(false);
	});

	it('treats an absent archived flag and an explicit false as equal', () => {
		// The server reads both as "hide archived", so they must not look like a change.
		expect(isSameSearchRequest(BASE, { ...BASE, include_archived: false })).toBe(true);
		expect(isSameSearchRequest({ ...BASE, include_archived: false }, BASE)).toBe(true);
	});
});
