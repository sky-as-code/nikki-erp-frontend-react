import { describe, expect, it } from 'vitest';

import {
	displayedEdgeNames, displayedFieldLabelKeys, displayedFieldNames, readFieldValue,
	relationDestSchemaName, resolveSchemaField,
} from './displayedFields';

import type * as dyn from '@nikkierp/common/dynamicModel';


function schema(partial: Partial<dyn.ModelSchema>): dyn.ModelSchema {
	return { name: 'inventory_product_variant', fields: {}, ...partial } as dyn.ModelSchema;
}

function field(name: string): dyn.ModelSchemaField {
	return { name, label: { 'en-US': name } } as unknown as dyn.ModelSchemaField;
}

const variantSchema = schema({
	fields: { sku: field('sku'), cost: field('cost') },
	to_relations: [{
		edge: 'product_template',
		src_field: 'product_template_id',
		dest_schema_name: 'inventory_product_template',
		relation_type: 'many:one',
	}],
});

const templateSchema = schema({
	name: 'inventory_product_template',
	fields: { name: field('name'), uom_name: field('uom_name') },
});

const lookup = (name: string) => name === 'inventory_product_template' ? templateSchema : undefined;

describe('displayedFieldNames', () => {
	// An empty `fields` would ask the server for no columns at all; omitting it is what makes the
	// server fall back to the model's own default set.
	it('is undefined when nothing is declared', () => {
		expect(displayedFieldNames(undefined)).toBeUndefined();
		expect(displayedFieldNames([])).toBeUndefined();
	});

	it('keeps the declared order and unwraps the object form', () => {
		const declared = ['sku', { field: 'product_template.name', label: 'fields.product_name' }, 'cost'];
		expect(displayedFieldNames(declared)).toEqual(['sku', 'product_template.name', 'cost']);
	});
});

describe('displayedFieldLabelKeys', () => {
	it('maps only the entries that carry their own label', () => {
		const declared = ['sku', { field: 'cost', label: 'fields.unit_cost' }];
		expect(displayedFieldLabelKeys(declared)).toEqual({ cost: 'fields.unit_cost' });
	});

	it('is empty when nothing is declared', () => {
		expect(displayedFieldLabelKeys(undefined)).toEqual({});
	});
});

describe('resolveSchemaField', () => {
	it('reads a flat field off the schema itself', () => {
		expect(resolveSchemaField(variantSchema, 'sku', lookup)?.name).toBe('sku');
	});

	it('walks one edge to the destination schema', () => {
		expect(resolveSchemaField(variantSchema, 'product_template.name', lookup)?.name).toBe('name');
	});

	// The related schema arrives a render later than the list's own, so a miss has to stay a miss
	// rather than throwing on a column the page legitimately declared.
	it('is undefined while the related schema is still loading', () => {
		expect(resolveSchemaField(variantSchema, 'product_template.name', () => undefined)).toBeUndefined();
	});

	it('is undefined for an unknown edge or leaf', () => {
		expect(resolveSchemaField(variantSchema, 'nope.name', lookup)).toBeUndefined();
		expect(resolveSchemaField(variantSchema, 'product_template.nope', lookup)).toBeUndefined();
	});
});

describe('readFieldValue', () => {
	// The server nests a selected edge field under the edge name, so the dotted name is a path and
	// never a literal key on the row.
	it('walks the path into the nested edge object', () => {
		const row = { sku: 'ABC', product_template: { name: 'Coca Cola' } };
		expect(readFieldValue(row, 'product_template.name')).toBe('Coca Cola');
	});

	it('reads a flat field directly', () => {
		expect(readFieldValue({ sku: 'ABC' }, 'sku')).toBe('ABC');
	});

	it('is undefined when the edge object is absent or not an object', () => {
		expect(readFieldValue({}, 'product_template.name')).toBeUndefined();
		expect(readFieldValue({ product_template: null }, 'product_template.name')).toBeUndefined();
		expect(readFieldValue({ product_template: 'x' }, 'product_template.name')).toBeUndefined();
	});
});

describe('relationDestSchemaName / displayedEdgeNames', () => {
	it('finds the schema an edge points at', () => {
		expect(relationDestSchemaName(variantSchema, 'product_template')).toBe('inventory_product_template');
		expect(relationDestSchemaName(variantSchema, 'nope')).toBeUndefined();
	});

	it('lists each reached edge once', () => {
		const fields = ['sku', 'product_template.name', 'product_template.uom_name'];
		expect(displayedEdgeNames(fields)).toEqual(['product_template']);
	});

	it('is empty when no column reaches an edge', () => {
		expect(displayedEdgeNames(['sku', 'cost'])).toEqual([]);
	});
});
