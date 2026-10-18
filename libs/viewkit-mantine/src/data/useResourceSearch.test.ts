import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import { isSameSearchRequest } from './searchRequest';
import { isStubSearchData, refusalOf, withBaseGraph } from './useResourceSearch';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { SearchData } from '@nikkierp/ui/components/ExcelDataTable';


/** The resolution `useResourceSearch` applies to pick what reaches `DataTable`. */
function resolveSearchData(live: SearchData | null, cached: SearchData | null): SearchData | null {
	return isStubSearchData(live) ? (cached ?? live) : (live ?? cached);
}


function buildSearchData(overrides: Partial<SearchData> = {}): SearchData {
	return {
		items: [],
		total: 0,
		page: 0,
		size: 50,
		desired_fields: ['display_name'],
		masked_fields: [],
		schema_etag: 'etag-1',
		...overrides,
	} as SearchData;
}


describe('isStubSearchData', () => {
	it('flags the size-0 placeholder that RestApi.search resolves locally', () => {
		const stub = buildSearchData({ size: 0, desired_fields: [] });

		expect(isStubSearchData(stub)).toBe(true);
	});

	it('does not flag a real response', () => {
		expect(isStubSearchData(buildSearchData())).toBe(false);
	});

	// An empty resource still answers with its columns, so it must reach the table:
	// treating it as a stub would leave the previous resource's rows on screen.
	it('does not flag an empty result that still carries its columns', () => {
		const empty = buildSearchData({ items: [], total: 0 });

		expect(isStubSearchData(empty)).toBe(false);
	});

	it('does not flag a sized response whose columns are absent', () => {
		expect(isStubSearchData(buildSearchData({ desired_fields: [] }))).toBe(false);
	});

	it('treats no data as not a stub, so the cache fallback still applies', () => {
		expect(isStubSearchData(null)).toBe(false);
	});
});

describe('resolving what reaches the table', () => {
	// Regression: suppressing the stub outright stalled a cold load forever. `DataTable`
	// rewriting the stub's `size: 0` is what issues the first real search, so with nothing
	// cached the stub must still be handed over.
	it('passes the stub through on a cold load, so the real search can start', () => {
		const stub = buildSearchData({ size: 0, desired_fields: [] });

		expect(resolveSearchData(stub, null)).toBe(stub);
	});

	// Regression: the stub resolves synchronously, so on a revisit it beat the real response
	// and rendered a header-less table over the cached rows.
	it('prefers cached rows over the stub, so columns never blank out', () => {
		const stub = buildSearchData({ size: 0, desired_fields: [] });
		const cached = buildSearchData();

		expect(resolveSearchData(stub, cached)).toBe(cached);
	});

	it('prefers a real response over the cache', () => {
		const live = buildSearchData({ schema_etag: 'etag-2' });
		const cached = buildSearchData();

		expect(resolveSearchData(live, cached)).toBe(live);
	});

	it('falls back to the cache while a request is in flight', () => {
		const cached = buildSearchData();

		expect(resolveSearchData(null, cached)).toBe(cached);
	});
});

describe('refusalOf', () => {
	it('names the entitlements of a refused search, and nothing for a failed schema', () => {
		const refusal = new ClientErrorItem({
			key: 'common:err_insufficient_permissions', message: 'no', type: 'authorization',
			vars: { entitlements: ['read:iam_role:org/ORG1'] },
		});
		expect(refusalOf([refusal], false)).toEqual(['read:iam_role:org/ORG1']);
		expect(refusalOf([], true)).toEqual([]);
		expect(refusalOf([], false)).toBeNull();
	});
});

describe('withBaseGraph', () => {
	const request: dyn.RestSearchRequest = { page: 0, size: 20, search_name: 'default' };
	const scope: dyn.SearchGraph = { if: ['assigned_users', 'linked', 'user-a'] };

	it('returns the request itself when there is no base', () => {
		expect(withBaseGraph(request, undefined)).toBe(request);
	});

	it('scopes an unfiltered request to the base', () => {
		expect(withBaseGraph(request, scope).graph).toEqual(scope);
	});

	it('ANDs the user filter with the base rather than replacing it', () => {
		const userGraph: dyn.SearchGraph = { if: ['name', '*', 'admin'], order: [['name', 'asc']] };

		expect(withBaseGraph({ ...request, graph: userGraph }, scope).graph).toEqual({
			and: [scope, { if: ['name', '*', 'admin'] }], order: [['name', 'asc']],
		});
	});
});

/**
 * The round trip between `useResourceSearch` and an embedded table: the table is seeded with the
 * hook's `userRequest` on every mount and echoes that seed back through `onSearchRequestChange`.
 */
function mountTableFor(state: dyn.RestSearchRequest, scope: dyn.SearchGraph, seedMerged = false) {
	const echo = { ...(seedMerged ? withBaseGraph(state, scope) : state) };
	const next = isSameSearchRequest(state, echo) ? state : echo;
	return { state: next, published: withBaseGraph(next, scope), republished: next !== state };
}

describe('seeding an embedded table across parent records', () => {
	const initial: dyn.RestSearchRequest = { page: 0, size: 20, search_name: 'default' };
	const scopeOf = (id: string): dyn.SearchGraph => ({ if: ['assigned_users', 'linked', id] });

	// Regression (IAM-001): seeding the table with the merged request echoed record A's scope back
	// as the user's own graph, so record B searched `B AND A` and came back empty, and so did A.
	it('publishes only the scope of the selected record when switching A, B, then A', () => {
		let state = initial;
		for (const id of ['user-a', 'user-b', 'user-a']) {
			const mounted = mountTableFor(state, scopeOf(id));
			state = mounted.state;

			expect(mounted.published.graph).toEqual(scopeOf(id));
		}
	});

	it('compounds the scopes when seeded with the merged request (the old wiring)', () => {
		const onA = mountTableFor(initial, scopeOf('user-a'), true);
		const onB = mountTableFor(onA.state, scopeOf('user-b'), true);

		expect(onA.state.graph).toEqual(scopeOf('user-a'));
		expect(JSON.stringify(onB.published.graph)).toContain('user-a');
	});

	it('does not republish on mount, since the echo equals the seed', () => {
		expect(mountTableFor(initial, scopeOf('user-a')).republished).toBe(false);
	});
});
