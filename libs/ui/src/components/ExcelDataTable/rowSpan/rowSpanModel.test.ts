import { describe, expect, it } from 'vitest';

import {
	cellSpanOf, flattenRowSpanItems, groupUpdateOf, groupWithSubAdded, groupWithSubRemoved, newGroupOf,
	rowSpanActionColumns, SUB_ROW_ACTIONS_KEY,
} from './rowSpanModel';
import {
	buildRowSpanFlatSchema, flattenRowSpanFields, resolveRowSpanConfig, rowSpanSchemaFromJson,
} from './rowSpanSchema';

import type { RowSpanConfig } from './rowSpanSchema';


const schema = rowSpanSchemaFromJson({
	name: 'inventory_moves_table',
	fields: [
		{ name: 'product_template_id', label: { $ref: 'fields.product_template' }, data_type: 'ulid' },
		{
			name: 'attributes',
			data_type: 'model',
			fields: [
				{ name: 'product_attribute_id', label: { $ref: 'fields.product_attribute_id' }, data_type: 'ulid' },
				{ name: 'product_attribute_value_id', data_type: 'ulid' },
				{ name: 'description', data_type: 'string' },
			],
			edges_to: [
				{ dest_schema: 'inventory_product_template_attribute', key_map: { product_attribute_id: 'id' } },
				{ dest_schema: 'inventory_product_attribute_value', key_map: { product_attribute_value_id: 'id' } },
			],
		},
		{ name: 'demand_quantity', data_type: 'decimal' },
	],
	edges_to: [{ dest_schema: 'inventory_product_template', key_map: { product_template_id: 'id' } }],
});

const config = resolveRowSpanConfig(schema, 'product_template_id', 'attributes').config as RowSpanConfig;

const group = {
	id: 'm1',
	etag: 'e1',
	product_template_id: 'T1',
	demand_quantity: '20',
	attributes: [
		{ id: 'line1', product_attribute_id: 'A1', product_attribute_value_id: 'V1', description: 'one' },
		{ product_attribute_id: 'A2', product_attribute_value_id: 'V2', description: 'two' },
	],
};

describe('rowSpanSchema', () => {
	it('converts the model JSON form: field map, wrapped types, edges as many:one relations', () => {
		expect(schema.fields.product_template_id.data_type).toEqual({ name: 'ulid' });
		expect(schema.to_relations).toEqual([{
			edge: 'product_template', src_field: 'product_template_id',
			dest_schema_name: 'inventory_product_template', relation_type: 'many:one',
		}]);
		expect(config.nestedFields).toEqual(['product_attribute_id', 'product_attribute_value_id', 'description']);
		expect(config.nestedRelations.map(relation => relation.src_field))
			.toEqual(['product_attribute_id', 'product_attribute_value_id']);
	});

	it('builds one flat schema with the nested relations, nested fields unsortable', () => {
		const flat = buildRowSpanFlatSchema(schema, config);
		expect(Object.keys(flat.fields)).toEqual([
			'product_template_id', 'demand_quantity', 'product_attribute_id', 'product_attribute_value_id', 'description',
		]);
		expect(flat.fields.description.is_sortable).toBe(false);
		expect(flat.to_relations).toHaveLength(3);
	});

	it('expands rowSingleField in place, or appends the nested fields when it is not displayed', () => {
		expect(flattenRowSpanFields(['product_template_id', 'attributes', 'demand_quantity'], config)).toEqual([
			'product_template_id', 'product_attribute_id', 'product_attribute_value_id', 'description', 'demand_quantity',
		]);
		expect(flattenRowSpanFields(['demand_quantity'], config)).toEqual([
			'demand_quantity', 'product_attribute_id', 'product_attribute_value_id', 'description',
		]);
	});

	it('refuses a pair it cannot render, and stays silent without the props', () => {
		expect(resolveRowSpanConfig(schema, undefined, undefined)).toEqual({ config: null, problems: [] });
		expect(resolveRowSpanConfig(schema, 'product_template_id', 'demand_quantity').problems[0])
			.toMatch(/must be a field of data_type 'model'/);
		expect(resolveRowSpanConfig(schema, undefined, 'attributes').problems).toHaveLength(1);
		const nestedModel = rowSpanSchemaFromJson({ name: 's', fields: [
			{ name: 'a', data_type: 'ulid' },
			{ name: 'm', data_type: 'model', fields: [{ name: 'deep', data_type: 'model', fields: [] }] },
		] });
		expect(resolveRowSpanConfig(nestedModel, 'a', 'm').problems.join()).toMatch(/one nesting level/);
	});
});

describe('rowSpanModel', () => {
	const flat = flattenRowSpanItems([group, { id: 'm2', etag: 'e2', product_template_id: 'T2' }], config);

	it('flattens each group into sub-rows carrying the group fields, one row for a group without any', () => {
		expect(flat.rows.map(row => row.id)).toEqual(['m1:0', 'm1:1', 'm2:-']);
		expect(flat.rows[1]).toMatchObject({
			product_template_id: 'T1', demand_quantity: '20', product_attribute_id: 'A2', etag: 'e1',
		});
		expect(flat.rows[0]).not.toHaveProperty('attributes');
		expect(flat.places.get('m2:-')).toMatchObject({ groupId: 'm2', subIndex: -1, subCount: 0 });
		expect(flat.groups.map(entry => entry.rowIds)).toEqual([['m1:0', 'm1:1'], ['m2:-']]);
	});

	it('re-nests a flat write into the whole group, keeping the sub-row keys', () => {
		const place = flat.places.get('m1:0')!;
		const next = groupUpdateOf(place, { id: 'm1:0', etag: 'e1', product_attribute_value_id: 'V9', demand_quantity: '5' }, config);
		expect(next).toEqual({
			...group,
			demand_quantity: '5',
			attributes: [{ ...group.attributes[0], product_attribute_value_id: 'V9' }, group.attributes[1]],
		});
	});

	it('adds, removes and creates groups in the nested shape', () => {
		const added = groupWithSubAdded(group, { product_template_id: 'T1', product_attribute_id: 'A3' }, config);
		expect(added.attributes).toEqual([...group.attributes, { product_attribute_id: 'A3' }]);
		expect(groupWithSubRemoved(flat.places.get('m1:0')!, config).attributes).toEqual([group.attributes[1]]);
		expect(newGroupOf({ product_template_id: 'T3', demand_quantity: '1', product_attribute_id: 'x' }, config))
			.toEqual({ product_template_id: 'T3', demand_quantity: '1', attributes: [] });
	});

	it('spans the group cells over its rows and the sub-row insert line', () => {
		const first = flat.places.get('m1:0');
		const second = flat.places.get('m1:1');
		const empty = flat.places.get('m2:-');
		expect(cellSpanOf(first, 'product_template_id', config, true)).toEqual({ skip: false, rowSpan: 3 });
		expect(cellSpanOf(first, 'product_template_id', config, false)).toEqual({ skip: false, rowSpan: 2 });
		expect(cellSpanOf(second, 'demand_quantity', config, true)).toEqual({ skip: true });
		expect(cellSpanOf(second, 'product_attribute_id', config, true)).toEqual({ skip: false });
		expect(cellSpanOf(empty, 'product_attribute_id', config, true)).toEqual({ skip: false, blank: true });
		expect(cellSpanOf(empty, SUB_ROW_ACTIONS_KEY, config, true)).toEqual({ skip: false, blank: true });
		expect(cellSpanOf(empty, 'product_template_id', config, false)).toEqual({ skip: false });
	});

	it('keeps the nested columns contiguous and adds the sub-row actions column last', () => {
		const columns = rowSpanActionColumns([{ key: 'x', afterField: 'product_attribute_id', actions: [] }], config, true);
		expect(columns.map(column => [column.key, column.afterField])).toEqual([
			['x', 'description'], ['rowSpanSubRow', undefined],
		]);
	});
});
