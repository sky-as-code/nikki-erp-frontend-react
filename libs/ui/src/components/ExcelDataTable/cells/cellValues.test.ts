import { describe, expect, it } from 'vitest';

import { MoneyFieldRenderer } from './cellRenderers';
import { getCellAlignment, getCellText, getCellValue, getFieldSchema, resolveEdgeLabel } from './cellValues';

import type * as dyn from '@nikkierp/common/dynamicModel';


const variantSchema = {
	name: 'inventory_product_variant',
	fields: { sku: { name: 'sku', label: { 'en-US': 'SKU' } } },
	to_relations: [{
		edge: 'product_template',
		src_field: 'product_template_id',
		dest_schema_name: 'inventory_product_template',
		relation_type: 'many:one',
	}],
} as unknown as dyn.ModelSchema;

const templateSchema = {
	name: 'inventory_product_template',
	record_label_field: 'name',
	fields: { name: { name: 'name', label: { 'en-US': 'Name' } } },
} as unknown as dyn.ModelSchema;

const related = { inventory_product_template: templateSchema };

describe('getCellValue', () => {
	// The server nests a selected edge field under the edge name, so a dotted column is a path to
	// walk and never a key on the row itself.
	it('walks into the nested edge object', () => {
		const row = { sku: 'ABC', product_template: { name: 'Coca Cola' } };
		expect(getCellValue(row, 'product_template.name')).toBe('Coca Cola');
	});

	it('reads a flat field directly', () => {
		expect(getCellValue({ sku: 'ABC' }, 'sku')).toBe('ABC');
	});

	it('is undefined when the path runs into a missing or non-object link', () => {
		expect(getCellValue({}, 'product_template.name')).toBeUndefined();
		expect(getCellValue({ product_template: null }, 'product_template.name')).toBeUndefined();
		expect(getCellValue({ product_template: 'x' }, 'product_template.name')).toBeUndefined();
		expect(getCellValue(undefined, 'sku')).toBeUndefined();
	});
});

describe('getCellText', () => {
	it('renders a nested value as text', () => {
		const row = { product_template: { name: 'Coca Cola' } };
		expect(getCellText(row, 'product_template.name', [])).toBe('Coca Cola');
	});

	it('is blank for an absent nested value rather than "undefined"', () => {
		expect(getCellText({}, 'product_template.name', [])).toBe('');
	});

	it('still masks a masked field', () => {
		const row = { product_template: { name: 'Coca Cola' } };
		expect(getCellText(row, 'product_template.name', ['product_template.name'])).toBe('********');
	});
});

describe('getFieldSchema', () => {
	it('reads a flat field off the schema itself', () => {
		expect(getFieldSchema(variantSchema, 'sku', related)?.name).toBe('sku');
	});

	it('walks one edge to the destination schema', () => {
		expect(getFieldSchema(variantSchema, 'product_template.name', related)?.name).toBe('name');
	});

	// The related schema arrives a render later than the list's own, so a miss has to stay a miss
	// rather than mislabelling the column or picking the wrong filter input for it.
	it('is undefined while the related schema is still loading', () => {
		expect(getFieldSchema(variantSchema, 'product_template.name', {})).toBeUndefined();
	});

	it('is undefined for an unknown edge, leaf or schema', () => {
		expect(getFieldSchema(variantSchema, 'nope.name', related)).toBeUndefined();
		expect(getFieldSchema(variantSchema, 'product_template.nope', related)).toBeUndefined();
		expect(getFieldSchema(undefined, 'sku', related)).toBeUndefined();
	});
});

describe('resolveEdgeLabel', () => {
	it('shows the target record label for a foreign-key column when the edge object is present', () => {
		const row = { product_template_id: '01H', product_template: { name: 'Coca Cola' } };
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related)).toBe('Coca Cola');
	});

	it('is undefined when the column is not a foreign key, the schema is missing or the edge was not selected', () => {
		const row = { product_template_id: '01H' };
		expect(resolveEdgeLabel(row, 'sku', variantSchema, related)).toBeUndefined();
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, {})).toBeUndefined();
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related)).toBeUndefined();
		expect(resolveEdgeLabel(row, 'product_template_id', undefined, related)).toBeUndefined();
	});
});

describe('getCellAlignment', () => {
	it('right-aligns numbers and money, left-aligns everything else', () => {
		const decimal = { name: 'p', data_type: { name: 'decimal' } } as unknown as dyn.ModelSchemaField;
		const text = { name: 't', data_type: 'string' } as unknown as dyn.ModelSchemaField;
		expect(getCellAlignment(decimal, undefined)).toBe('right');
		expect(getCellAlignment(text, undefined)).toBe('left');
		expect(getCellAlignment(text, new MoneyFieldRenderer('$'))).toBe('right');
		expect(getCellAlignment(undefined, undefined)).toBe('left');
	});
});
