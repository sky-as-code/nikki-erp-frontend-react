import { describe, expect, it } from 'vitest';

import { joinTestId, testAttrs } from './testAttributes';


describe('joinTestId', () => {
	it('joins segments with dots', () => {
		expect(joinTestId('identity', 'userList', 'search')).toBe('identity.userList.search');
	});

	it('skips empty segments so an optional prefix needs no branching', () => {
		expect(joinTestId(undefined, 'userList', 'search')).toBe('userList.search');
		expect(joinTestId('identity', null, 'search')).toBe('identity.search');
		expect(joinTestId('identity', '', 'search')).toBe('identity.search');
	});

	it('accepts numeric discriminators', () => {
		expect(joinTestId('inventory', 'stockTable', 'row', 3)).toBe('inventory.stockTable.row.3');
		expect(joinTestId('ui', 'pager', 'page', 0)).toBe('ui.pager.page.0');
	});

	it('returns undefined when nothing is left to join', () => {
		expect(joinTestId()).toBeUndefined();
		expect(joinTestId(undefined, null, '')).toBeUndefined();
	});
});

describe('testAttrs', () => {
	it('builds the data-testid attribute', () => {
		expect(testAttrs('identity', 'userList', 'search')).toEqual({
			'data-testid': 'identity.userList.search',
		});
	});

	it('emits nothing when the id is empty, rather than a blank attribute', () => {
		expect(testAttrs()).toEqual({});
		expect(testAttrs(undefined, '')).toEqual({});
	});
});
