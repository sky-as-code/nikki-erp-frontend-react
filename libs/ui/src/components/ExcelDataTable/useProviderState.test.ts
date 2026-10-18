import { describe, expect, it } from 'vitest';

import { buildInitialSearchRequest, isEditedRowDeselected } from './useProviderState';

import type { SearchData } from './types';


const stub = { items: [], total: 0, page: 0, size: 0 } as unknown as SearchData;

describe('isEditedRowDeselected', () => {
	it('is false when nothing is being edited', () => {
		expect(isEditedRowDeselected(null, [])).toBe(false);
	});

	it('is false while the edited row is still selected', () => {
		expect(isEditedRowDeselected('a', ['a'])).toBe(false);
	});

	it('is true once the selection moved to another row or was cleared', () => {
		expect(isEditedRowDeselected('a', ['b'])).toBe(true);
		expect(isEditedRowDeselected('a', [])).toBe(true);
	});
});

describe('buildInitialSearchRequest', () => {
	it('takes a fixed page size ahead of the request and the stub', () => {
		expect(buildInitialSearchRequest(stub, { size: 50 }, 100).size).toBe(100);
	});

	it('falls back to the request size without a fixed one', () => {
		expect(buildInitialSearchRequest(stub, { size: 50 }).size).toBe(50);
	});
});
