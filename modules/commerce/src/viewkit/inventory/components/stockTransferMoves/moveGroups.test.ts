import { flattenRowSpanItems, resolveRowSpanConfig } from '@nikkierp/ui/components/ExcelDataTable';
import { describe, expect, it } from 'vitest';

import { groupSavedMoves, MOVE_GROUP_SCHEMA, templateIdsOf, withMoveLabels } from './moveGroups';
import { toAttributeOptions, toValueOptions } from './moveOptions';


const moves = [
	{
		id: 'M2', etag: 'e2', sequence: 20, product_variant_id: 'V2', uom_id: 'U1', demand_quantity: '1',
		product_variant: { id: 'V2', product_template_id: 'T1' }, uom: { name: 'Unit' },
	},
	{
		id: 'M1', etag: 'e1', sequence: 10, product_variant_id: 'V1', uom_id: null, demand_quantity: '20',
		product_variant: { id: 'V1', product_template_id: 'T1' },
	},
];

const variantValues = [
	{ product_variant_id: 'V1', template_attribute_value: { id: 'TAV1', attribute_value: { id: 'RED', attribute_id: 'COLOR', name: 'Red' } } },
	{ product_variant_id: 'V1', template_attribute_value: { id: 'TAV2', attribute_value: { id: 'L', attribute_id: 'SIZE', name: 'L' } } },
	{ product_variant_id: 'V2', template_attribute_value: null },
];

describe('saved moves as groups', () => {
	it('groups each move with its variant template and catalogue attribute values, in sequence order', () => {
		const groups = groupSavedMoves(moves, variantValues);

		expect(groups.map(group => [group.id, group.product_template_id, group.demand_quantity])).toEqual([
			['M1', 'T1', '20'], ['M2', 'T1', '1'],
		]);
		expect(groups[0].attributes).toEqual([
			{ product_attribute_id: 'COLOR', product_attribute_value_id: 'RED', product_attribute_value: { name: 'Red' } },
			{ product_attribute_id: 'SIZE', product_attribute_value_id: 'L', product_attribute_value: { name: 'L' } },
		]);
		expect(groups[1].attributes).toEqual([]);
		expect(templateIdsOf(groups)).toEqual(['T1']);
	});

	it('labels the template and attributes where read cells look for them', () => {
		const [group] = withMoveLabels(groupSavedMoves(moves, variantValues), {
			templateNames: new Map([['T1', 'Shirt']]), attributeNames: new Map([['COLOR', 'Color']]),
		});

		expect(group.product_template).toEqual({ name: 'Shirt' });
		expect(group.attributes[0].product_attribute).toEqual({ name: 'Color' });
	});

	it('is a valid grouped table schema: two moves of one template stay two groups', () => {
		const { config, problems } = resolveRowSpanConfig(MOVE_GROUP_SCHEMA, 'product_template_id', 'attributes');

		expect(problems).toEqual([]);
		expect(config?.nestedFields).toEqual(['product_attribute_id', 'product_attribute_value_id']);
		expect(config?.nestedRelations.map(relation => relation.dest_schema_name))
			.toEqual(['inventory_product_attribute', 'inventory_product_attribute_value']);
		const flat = flattenRowSpanItems(groupSavedMoves(moves, variantValues), config!);
		expect(flat.groups.map(group => group.groupId)).toEqual(['M1', 'M2']);
	});
});

describe('move picker options', () => {
	it('offers the enabled, variant-making attributes of the template by catalogue id', () => {
		const options = toAttributeOptions([
			{ id: 'TA1', attribute_id: 'COLOR', is_enabled: true, variant_creation_snapshot: 'instant', attribute: { name: 'Color' } },
			{ id: 'TA2', attribute_id: 'GIFT', is_enabled: true, variant_creation_snapshot: 'never', attribute: { name: 'Gift' } },
			{ id: 'TA3', attribute_id: 'OLD', is_enabled: false, attribute: { name: 'Old' } },
			{ id: 'TA4', attribute_id: 'SIZE', is_enabled: true, attribute: { name: 'Size', variant_creation_mode: 'dynamic' } },
			{ id: 'TA5', attribute_id: 'NOTE', is_enabled: true, attribute: { name: 'Note', variant_creation_mode: 'never' } },
		], 'en-US');

		expect(options).toEqual([
			{ value: 'COLOR', label: 'Color', templateAttributeId: 'TA1' },
			{ value: 'SIZE', label: 'Size', templateAttributeId: 'TA4' },
		]);
	});

	it('offers the values the template still selects, by catalogue value id', () => {
		expect(toValueOptions([
			{ id: 'TAV1', attribute_value_id: 'RED', attribute_value_name: { 'en-US': 'Red' }, is_selected: true },
			{ id: 'TAV2', attribute_value_id: 'BLUE', attribute_value_name: 'Blue', is_selected: false },
		], 'en-US')).toEqual([{ value: 'RED', label: 'Red' }]);
	});
});
