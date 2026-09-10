import { describe, expect, it } from 'vitest';
import { utils, write } from 'xlsx';

import { autoMatch, buildMappingPayload, missingMandatory, moveSource, moveTarget } from './autoMatch';
import { parseHeadersFromData, tableFromRows, validateImportFile } from './parseHeaders';
import { buildImportTargets, isImportTarget, isMandatoryTarget, resolveFieldLabel } from './targets';

import type { ModelSchema, ModelSchemaField } from '@nikkierp/common/dynamicModel';


function field(name: string, extra: Partial<ModelSchemaField> = {}): ModelSchemaField {
	return { name, label: { 'en-US': name }, data_type: { name: 'string' } as any, ...extra };
}

/** A product-like schema with a category reference, as the backend serves it. */
function productSchema(): ModelSchema {
	const fields = [
		field('id', { is_primary_key: true, is_auto_generated: true, is_system_field: true }),
		field('org_id', { is_required_for_create: true, is_system_field: true }),
		field('etag', { data_type: { name: 'nikkiEtag' } as any, is_system_field: true }),
		field('name', { label: { 'en-US': 'Name', 'vi-VN': 'Tên' }, is_required_for_create: true }),
		field('qty', { label: { 'en-US': 'Quantity' } }),
		field('category_id', { label: { 'en-US': 'Category', 'vi-VN': 'Phân loại' }, is_foreign_key: true, is_system_field: true }),
		field('category', { is_edge_model: true, is_computed: true, is_virtual: true }),
		field('source_system', { is_required_for_create: true, default_value: 'manual' }),
		field('external_id', { label: { $ref: 'fields.external_id' } }),
	];
	return {
		name: 'inventory_product_template',
		fields: Object.fromEntries(fields.map(f => [f.name, f])),
		etag: 'e',
		to_relations: [{ edge: 'category', src_field: 'category_id', dest_schema_name: 'inventory_product_category', relation_type: 'many:one' }],
	} as unknown as ModelSchema;
}

const translate = (key: string): string => (key === 'fields.external_id' ? 'External ID' : key);
const targetsOf = (schema: ModelSchema, language = 'vi-VN') => buildImportTargets(schema, language, translate, 'liên kết');

describe('targets', () => {
	it('offers only client-writable fields, foreign keys included', () => {
		const names = targetsOf(productSchema()).map(t => t.name);

		expect(names).toEqual(['name', 'qty', 'category_id', 'source_system', 'external_id']);
	});

	it('marks required-without-default and external_id as mandatory', () => {
		const schema = productSchema();

		expect(isMandatoryTarget(schema.fields.name)).toBe(true);
		expect(isMandatoryTarget(schema.fields.external_id)).toBe(true);
		expect(isMandatoryTarget(schema.fields.source_system)).toBe(false);
		expect(isMandatoryTarget(schema.fields.qty)).toBe(false);
		expect(isImportTarget(schema.fields.org_id)).toBe(false);
	});

	it('resolves a label through current language, default language, then the field name', () => {
		const schema = productSchema();

		expect(resolveFieldLabel(schema.fields.name, 'vi-VN', translate)).toBe('Tên');
		expect(resolveFieldLabel(schema.fields.qty, 'vi-VN', translate)).toBe('Quantity');
		expect(resolveFieldLabel(schema.fields.external_id, 'vi-VN', translate)).toBe('External ID');
		expect(resolveFieldLabel(field('bare', { label: {} }), 'vi-VN', translate)).toBe('bare');
	});

	it('suffixes an edge field with the localized reference marker and names its target schema', () => {
		const category = targetsOf(productSchema()).find(t => t.name === 'category_id');

		expect(category).toMatchObject({
			label: 'Phân loại (liên kết)', isEdge: true, destSchemaName: 'inventory_product_category',
		});
		expect(category?.matchKeys).toEqual(['phân loại', 'category', 'category_id']);
	});
});

describe('autoMatch', () => {
	it('pairs headers by label in any language, mandatory rows first, leftovers trailing', () => {
		const rows = autoMatch(['Extra', 'quantity', ' Tên ', 'ID', 'external id'], targetsOf(productSchema()));

		expect(rows.map(r => [r.source, r.target?.name ?? null])).toEqual([
			[' Tên ', 'name'],
			['external id', 'external_id'],
			['quantity', 'qty'],
			[null, 'category_id'],
			[null, 'source_system'],
			['Extra', null],
			['ID', null],
		]);
	});

	it('never assigns one header to two targets', () => {
		const targets = targetsOf(productSchema());
		const rows = autoMatch(['name', 'name'], targets);

		expect(rows.filter(r => r.source === 'name')).toHaveLength(1);
	});

	it('lists the mandatory targets without a column and builds the payload from the paired rows', () => {
		const rows = autoMatch(['Tên'], targetsOf(productSchema()));

		expect(missingMandatory(rows).map(t => t.name)).toEqual(['external_id']);
		expect(buildMappingPayload(rows, 'vi-VN', true)).toEqual({
			language_code: 'vi-VN',
			create_missing_references: true,
			columns: [{ source: 'Tên', target: 'name' }],
		});
	});

	it('moves one column independently of the other', () => {
		const rows = autoMatch(['Tên', 'quantity'], targetsOf(productSchema()));

		const movedSources = moveSource(rows, 0, 1);
		expect(movedSources.map(r => r.source).slice(0, 2)).toEqual([null, 'Tên']);
		expect(movedSources.map(r => r.target?.name).slice(0, 2)).toEqual(['name', 'external_id']);

		const movedTargets = moveTarget(rows, 0, 2);
		expect(movedTargets.map(r => r.target?.name).slice(0, 3)).toEqual(['external_id', 'qty', 'name']);
		expect(movedTargets.map(r => r.source).slice(0, 3)).toEqual(['Tên', null, 'quantity']);
	});
});

describe('parseHeaders', () => {
	it('refuses a wrong extension and an oversized file before upload', () => {
		expect(validateImportFile({ name: 'a.xls', size: 1 })).toBe('unsupportedFile');
		expect(validateImportFile({ name: 'a.CSV', size: 11 }, 10)).toBe('fileTooLarge');
		expect(validateImportFile({ name: 'a.xlsx', size: 10 }, 10)).toBeNull();
	});

	it('reads a csv header row, sniffing the delimiter and normalising whitespace', () => {
		const parsed = parseHeadersFromData('﻿Tên  sản phẩm;Giá;\nCoke;12000;\n\n');

		expect(parsed.headers).toEqual(['Tên sản phẩm', 'Giá']);
		expect(parsed.preview).toEqual([['Coke', '12000']]);
		expect(parsed.rowCount).toBe(1);
	});

	it('reads the first sheet of an xlsx workbook', () => {
		const book = utils.book_new();
		utils.book_append_sheet(book, utils.aoa_to_sheet([[], ['ID', 'Name'], ['E1', 'Coke'], ['E2', 'Pepsi']]), 'Data');
		utils.book_append_sheet(book, utils.aoa_to_sheet([['Other']]), 'Second');
		const bytes = write(book, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

		const parsed = parseHeadersFromData(bytes);

		expect(parsed.headers).toEqual(['ID', 'Name']);
		expect(parsed.rowCount).toBe(2);
		expect(parsed.preview[1]).toEqual(['E2', 'Pepsi']);
	});

	it('reports no headers for an empty table', () => {
		expect(tableFromRows([[], ['', ' ']])).toEqual({ headers: [], preview: [], rowCount: 0 });
	});
});
