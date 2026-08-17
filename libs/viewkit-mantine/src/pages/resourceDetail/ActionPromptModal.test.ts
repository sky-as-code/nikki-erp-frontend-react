import { describe, expect, it } from 'vitest';

import { buildPromptDefaults, buildPromptSchema } from './ActionPromptModal';
import { resourceDetailExtraActionSchema } from './props';

import type * as dyn from '@nikkierp/common/dynamicModel';


function field(
	name: string, dataType: dyn.ModelSchemaFieldDataTypeName, extra: Partial<dyn.ModelSchemaField> = {},
): dyn.ModelSchemaField {
	return { name, label: { 'en-US': name }, data_type: { name: dataType }, ...extra } as dyn.ModelSchemaField;
}

/** Modelled on `inventory_stock_quant`, whose count actions motivated the prompt. */
const quantSchema = {
	name: 'inventory_stock_quant',
	fields: {
		id: field('id', 'ulid', { is_primary_key: true, is_system_field: true }),
		product_variant_id: field('product_variant_id', 'ulid', { is_required_for_create: true }),
		on_hand_quantity: field('on_hand_quantity', 'decimal'),
		counted_quantity: field('counted_quantity', 'decimal'),
		count_reason_code: field('count_reason_code', 'string'),
		org_id: field('org_id', 'ulid', { is_required_for_create: true }),
	},
} as unknown as dyn.ModelSchema;


describe('buildPromptSchema', () => {
	it('keeps only the prompt\'s own fields', () => {
		// The point of narrowing: AdhocFormProvider validates every field of the schema it is
		// given, so an unnarrowed schema would demand product_variant_id and org_id and the
		// dialog could never submit.
		const narrowed = buildPromptSchema(quantSchema, [
			{ name: 'counted_quantity' }, { name: 'count_reason_code' },
		]);

		expect(Object.keys(narrowed.fields)).toEqual(['counted_quantity', 'count_reason_code']);
	});

	it('carries the rest of the schema through unchanged', () => {
		const narrowed = buildPromptSchema(quantSchema, [{ name: 'counted_quantity' }]);

		expect(narrowed.name).toBe('inventory_stock_quant');
		expect(narrowed.fields.counted_quantity.data_type.name).toBe('decimal');
	});

	it('applies a required override without touching the original schema', () => {
		const narrowed = buildPromptSchema(quantSchema, [{ name: 'counted_quantity', required: true }]);

		expect(narrowed.fields.counted_quantity.is_required_for_create).toBe(true);
		// The base schema is shared with the rest of the page, so mutating it would make a dialog
		// change how the record's own form behaves.
		expect(quantSchema.fields.counted_quantity.is_required_for_create).toBeUndefined();
	});

	it('drops a field name that is not on the schema', () => {
		// A typo should cost one missing input, not a resolver pointing at a field that does not
		// exist.
		const narrowed = buildPromptSchema(quantSchema, [
			{ name: 'counted_quantity' }, { name: 'no_such_field' },
		]);

		expect(Object.keys(narrowed.fields)).toEqual(['counted_quantity']);
	});
});

describe('buildPromptDefaults', () => {
	it('prefills from the named field of the record', () => {
		const defaults = buildPromptDefaults(
			[{ name: 'counted_quantity', defaultFromField: 'on_hand_quantity' }],
			{ on_hand_quantity: '42' },
		);

		expect(defaults).toEqual({ counted_quantity: '42' });
	});

	it('omits a field with no default rather than blanking it', () => {
		const defaults = buildPromptDefaults([{ name: 'count_reason_code' }], { on_hand_quantity: '42' });

		expect(defaults).toEqual({});
	});

	it('omits a default whose source is absent on the record', () => {
		// Writing undefined through would render the input pre-filled with an empty value the user
		// then has to clear.
		const defaults = buildPromptDefaults(
			[{ name: 'counted_quantity', defaultFromField: 'on_hand_quantity' }],
			{},
		);

		expect(defaults).toEqual({});
	});
});

describe('the contextual action schema', () => {
	it('accepts an action with no prompt, which is what every existing page authors', () => {
		const parsed = resourceDetailExtraActionSchema.parse({
			label: 'actions.confirm', command: 'inventory.transfer.confirm',
		});

		expect(parsed.prompt).toBeUndefined();
	});

	it('accepts a prompt listing schema field names', () => {
		const parsed = resourceDetailExtraActionSchema.parse({
			label: 'actions.enter_count',
			command: 'inventory.quant.enter_count',
			prompt: {
				title: 'actions.enter_count.title',
				fields: [{ name: 'counted_quantity', required: true, defaultFromField: 'on_hand_quantity' }],
			},
		});

		expect(parsed.prompt?.fields).toHaveLength(1);
	});

	it('rejects a prompt with no fields', () => {
		// A dialog that asks for nothing is a confirmation step nobody requested; the action should
		// simply not declare a prompt.
		expect(() => resourceDetailExtraActionSchema.parse({
			label: 'x', command: 'y', prompt: { title: 't', fields: [] },
		})).toThrow();
	});

	it('rejects an unknown key, so a misspelled prompt fails where it is authored', () => {
		expect(() => resourceDetailExtraActionSchema.parse({
			label: 'x', command: 'y', prompts: { title: 't', fields: [{ name: 'a' }] },
		})).toThrow();
	});
});
