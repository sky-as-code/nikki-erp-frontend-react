import { describe, expect, it } from 'vitest';

import { FORM_DATA_TABLE_PAGE_SIZE, formDataTableCapabilities, formDataTableRequest } from './formDataTableModel';


describe('formDataTableCapabilities', () => {
	it('passes the capabilities through in update mode', () => {
		expect(formDataTableCapabilities(true, ['create', 'delete'])).toEqual(['create', 'delete']);
	});

	it('keeps undefined in update mode, so a legacy updateCommand still edits', () => {
		expect(formDataTableCapabilities(true, undefined)).toBeUndefined();
	});

	it('is read-only in view mode, overriding a legacy updateCommand', () => {
		expect(formDataTableCapabilities(false, ['create', 'update'])).toEqual([]);
		expect(formDataTableCapabilities(false, undefined)).toEqual([]);
	});
});

describe('formDataTableRequest', () => {
	it('requests one large first page of the fields', () => {
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
});
