import { describe, expect, it } from 'vitest';

import { isStubSearchData } from './useResourceSearch';

import type { SearchData } from '@nikkierp/ui/components/DataTable';


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
