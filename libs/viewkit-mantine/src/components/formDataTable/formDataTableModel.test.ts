import { describe, expect, it } from 'vitest';

import {
	FORM_DATA_TABLE_PAGE_SIZE, formDataTableRequest, isFormDataTablePaginated,
} from './formDataTableModel';


describe('formDataTableRequest', () => {
	it('requests the first page of the fields', () => {
		expect(formDataTableRequest(['name', 'code'], undefined)).toEqual({
			page: 0, size: FORM_DATA_TABLE_PAGE_SIZE, search_name: undefined, fields: ['name', 'code'],
		});
	});

	it('moves the insert row search field first', () => {
		expect(formDataTableRequest(['name', 'id'], 'id').fields).toEqual(['id', 'name']);
	});

	it('adds the insert row search field when it is not requested', () => {
		expect(formDataTableRequest(['name'], 'id', 'by_role').fields).toEqual(['id', 'name']);
	});

	it('widens the search to archived rows only when asked', () => {
		expect(formDataTableRequest(['name'], undefined, undefined, true).include_archived).toBe(true);
		expect(formDataTableRequest(['name'], undefined, undefined, false)).not.toHaveProperty('include_archived');
	});
});

describe('isFormDataTablePaginated', () => {
	it('pages 100 rows at a time', () => {
		expect(FORM_DATA_TABLE_PAGE_SIZE).toBe(100);
	});

	it('shows pagination only when the rows do not fit on one page', () => {
		expect(isFormDataTablePaginated(undefined)).toBe(false);
		expect(isFormDataTablePaginated(100)).toBe(false);
		expect(isFormDataTablePaginated(101)).toBe(true);
	});
});
