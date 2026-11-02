import { describe, expect, it } from 'vitest';

import { conditionalFieldRules, conditionalSourceFields, isConditionallyEmpty } from './conditionalFields';
import { buildValidationSchema } from './model_schema';

import type { ModelSchema, ModelSchemaField } from './model_schema';


function field(name: string, extra: Partial<ModelSchemaField> = {}): ModelSchemaField {
	return { name, label: { 'en-US': name }, data_type: { name: 'string' }, ...extra } as ModelSchemaField;
}

/** Modelled on `inventory_location`. */
const locationSchema = {
	name: 'inventory_location',
	fields: {
		id: field('id', { is_primary_key: true, is_auto_generated: true }),
		name: field('name', { is_required_for_create: true }),
		location_type: field('location_type', {
			is_required_for_create: true,
			optional_fields: { vendor: ['barcode'], group: ['barcode', 'removal_strategy'] },
			required_fields: { transit: ['removal_strategy'] },
		}),
		canonical_name: field('canonical_name', { is_auto_generated: true }),
		parent_location_id: field('parent_location_id'),
		barcode: field('barcode'),
		removal_strategy: field('removal_strategy'),
		description: field('description'),
	},
} as unknown as ModelSchema;

const sorted = (set: ReadonlySet<string>) => [...set].sort();

describe('conditionalFieldRules', () => {
	it('finds the source fields', () => {
		expect(conditionalSourceFields(locationSchema)).toEqual(['location_type']);
	});

	it('hides every other user field while the source holds a listed value', () => {
		const rules = conditionalFieldRules(locationSchema, { location_type: 'group' });
		expect(sorted(rules.hidden)).toEqual(['description', 'parent_location_id']);
		expect(rules.required.size).toBe(0);
	});

	it('requires and shows the required_fields entries', () => {
		const rules = conditionalFieldRules(locationSchema, { location_type: 'transit' });
		expect(sorted(rules.hidden)).toEqual(['barcode', 'description', 'parent_location_id']);
		expect(sorted(rules.required)).toEqual(['removal_strategy']);
	});

	it('changes nothing for an unset or unlisted value', () => {
		[undefined, '', 'internal'].forEach(value => {
			const rules = conditionalFieldRules(locationSchema, { location_type: value });
			expect(rules.hidden.size + rules.required.size).toBe(0);
		});
	});
});

describe('conditional required validation', () => {
	const schema = buildValidationSchema(locationSchema);

	it('requires a required_fields entry while its value is chosen', () => {
		const parsed = schema.safeParse({ name: 'A', location_type: 'transit', removal_strategy: '' });
		expect(parsed.error?.issues.map(issue => issue.path)).toEqual([['removal_strategy']]);
		expect(schema.safeParse({ name: 'A', location_type: 'transit', removal_strategy: 'fifo' }).success).toBe(true);
	});

	it('reports it with the other missing fields in one pass', () => {
		const parsed = schema.safeParse({ location_type: 'transit' });
		expect(parsed.error?.issues.map(issue => issue.path[0]).sort()).toEqual(['name', 'removal_strategy']);
	});

	it('requires nothing extra for another value', () => {
		expect(schema.safeParse({ name: 'A', location_type: 'group' }).success).toBe(true);
	});

	it('counts only nil, blank, empty list and empty map as empty', () => {
		expect([null, undefined, ' ', [], {}].every(isConditionallyEmpty)).toBe(true);
		expect([0, false, 'x', [1], { a: 1 }].some(isConditionallyEmpty)).toBe(false);
	});
});
