import { describe, expect, it } from 'vitest';

import { translateFieldDescription } from './fieldLabels';

import type * as dyn from '@nikkierp/common/dynamicModel';


const location = {
	name: 'inventory_location',
	fields: {
		usage: { name: 'usage', label: { $ref: 'fields.usage' }, description: { $ref: 'field_desc.loc.usage' } },
		name: { name: 'name', label: { $ref: 'fields.name' } },
	},
	to_relations: [{ edge: 'warehouse', dest_schema_name: 'inventory_warehouse' }],
} as unknown as dyn.ModelSchema;
const warehouse = {
	name: 'inventory_warehouse',
	fields: { kind: { name: 'kind', label: { $ref: 'fields.kind' }, description: { 'en-US': 'Kind\n* a: A' } } },
} as unknown as dyn.ModelSchema;
const related = { inventory_warehouse: warehouse };
const keys: Record<string, string> = { 'inventory_location:field_desc.loc.usage': 'What it is for' };
const translateRef = (key: string, schemaName: string): string | undefined => keys[`${schemaName}:${key}`];

describe('translateFieldDescription', () => {
	it('resolves the $ref against the schema owning the field', () => {
		expect(translateFieldDescription('usage', location, related, 'en-US', translateRef)).toBe('What it is for');
	});

	it('follows a dotted field to its edge schema', () => {
		expect(translateFieldDescription('warehouse.kind', location, related, 'en-US', translateRef)).toBe('Kind\n* a: A');
	});

	it('gives nothing for a field without a description, or one not loaded yet', () => {
		expect(translateFieldDescription('name', location, related, 'en-US', translateRef)).toBe('');
		expect(translateFieldDescription('warehouse.kind', location, {}, 'en-US', translateRef)).toBe('');
	});
});
