import { rowSpanSchemaFromJson } from '@nikkierp/ui/components/ExcelDataTable';

import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


export const TEMPLATE_FIELD = 'product_template_id';
export const ATTRIBUTES_FIELD = 'attributes';
export const ATTRIBUTE_FIELD = 'product_attribute_id';
export const VALUE_FIELD = 'product_attribute_value_id';
export const QUANTITY_FIELD = 'demand_quantity';
export const UOM_FIELD = 'uom_id';

/** The table's columns, in order; `attributes` expands in place to Attribute | Value. */
export const MOVE_GROUP_COLUMNS = [TEMPLATE_FIELD, ATTRIBUTES_FIELD, QUANTITY_FIELD, UOM_FIELD];

/** Where each column's label comes from in a read row (`{edge}.{field}`), as `edge_labels` names it. */
export const MOVE_EDGE_LABELS: Record<string, string> = {
	product_template: 'name',
	uom: 'name',
	product_attribute: 'name',
	product_attribute_value: 'name',
};

/**
 * One move as the table edits it: a product template and one value per variant-generating attribute,
 * which the backend resolves (or creates) into the move's variant, with its demand and unit. No backend
 * schema has this shape, so it lives here; its `$ref` labels resolve in the inventory namespace.
 */
export const MOVE_GROUP_SCHEMA = rowSpanSchemaFromJson({
	name: 'inventory_stock_transfer_move_group',
	fields: [
		{ name: 'id', data_type: 'ulid', is_primary_key: true },
		{ name: 'etag', data_type: 'string', is_auto_generated: true },
		{
			name: TEMPLATE_FIELD, label: { $ref: 'fields.product_template_id' }, data_type: 'ulid',
			is_required_for_create: true,
		},
		{
			name: ATTRIBUTES_FIELD,
			data_type: 'model',
			fields: [
				{ name: ATTRIBUTE_FIELD, label: { $ref: 'fields.attribute_id' }, data_type: 'ulid' },
				{ name: VALUE_FIELD, label: { $ref: 'fields.attribute_value_id' }, data_type: 'ulid' },
			],
			edges_to: [
				{ edge: 'product_attribute', dest_schema: 'inventory_product_attribute', key_map: { [ATTRIBUTE_FIELD]: 'id' } },
				{
					edge: 'product_attribute_value', dest_schema: 'inventory_product_attribute_value',
					key_map: { [VALUE_FIELD]: 'id' },
				},
			],
		},
		{
			name: QUANTITY_FIELD, label: { $ref: 'fields.demand_quantity' },
			data_type: { name: 'decimal', options: { scale: 4 } }, is_required_for_create: true,
		},
		{ name: UOM_FIELD, label: { $ref: 'fields.uom_id' }, data_type: 'ulid' },
	],
	edges_to: [
		{ edge: 'product_template', dest_schema: 'inventory_product_template', key_map: { [TEMPLATE_FIELD]: 'id' } },
		{ edge: 'uom', dest_schema: 'essential_uom', key_map: { [UOM_FIELD]: 'id' } },
	],
});

/** The first read: the transfer's moves, each with its variant's template. */
export const SAVED_MOVE_FIELDS = [
	'id', 'etag', 'sequence', 'product_variant_id', UOM_FIELD, QUANTITY_FIELD, 'status',
	'product_variant.product_template_id',
];
/** The second read: the catalogue value behind each of those variants' attribute values. */
export const VARIANT_VALUE_FIELDS = ['product_variant_id', 'template_attribute_value.attribute_value'];

export type MoveAttribute = Record<string, unknown> & {
	[ATTRIBUTE_FIELD]?: string | null,
	[VALUE_FIELD]?: string | null,
};

/** A saved variant's attribute values, as the table's sub-rows: catalogue attribute and value ids, value name kept. */
export function attributesByVariant(variantValues: SearchItem[]): Map<string, MoveAttribute[]> {
	const out = new Map<string, MoveAttribute[]>();
	for (const item of variantValues) {
		const line = item.template_attribute_value as SearchItem | null | undefined;
		const value = line?.attribute_value as SearchItem | undefined;
		if (!value?.id) {
			continue;
		}
		const list = out.get(String(item.product_variant_id)) ?? [];
		list.push({
			[ATTRIBUTE_FIELD]: String(value.attribute_id ?? ''),
			[VALUE_FIELD]: String(value.id),
			product_attribute_value: { name: value.name },
		});
		out.set(String(item.product_variant_id), list);
	}
	return out;
}

/** The saved moves as groups, in `sequence` order: template from the variant, attributes from the second read. */
export function groupSavedMoves(moves: SearchItem[], variantValues: SearchItem[]): SearchItem[] {
	const attributes = attributesByVariant(variantValues);
	return [...moves]
		.sort((left, right) => Number(left.sequence ?? 0) - Number(right.sequence ?? 0))
		.map(move => ({
			id: move.id,
			etag: move.etag,
			product_variant_id: move.product_variant_id,
			[TEMPLATE_FIELD]: (move.product_variant as SearchItem | undefined)?.product_template_id ?? null,
			[QUANTITY_FIELD]: move[QUANTITY_FIELD],
			[UOM_FIELD]: move[UOM_FIELD] ?? null,
			uom: move.uom,
			[ATTRIBUTES_FIELD]: attributes.get(String(move.product_variant_id)) ?? [],
		}));
}

export type MoveLabels = {
	templateNames: Map<string, unknown>,
	attributeNames: Map<string, unknown>,
};

/** Puts the template and attribute names where a read cell looks for them (`product_template.name`, …). */
export function withMoveLabels(groups: SearchItem[], labels: MoveLabels): SearchItem[] {
	return groups.map(group => ({
		...group,
		product_template: { name: labels.templateNames.get(String(group[TEMPLATE_FIELD] ?? '')) },
		[ATTRIBUTES_FIELD]: ((group[ATTRIBUTES_FIELD] ?? []) as MoveAttribute[]).map(attribute => ({
			...attribute,
			product_attribute: { name: labels.attributeNames.get(String(attribute[ATTRIBUTE_FIELD] ?? '')) },
		})),
	}));
}

/** Template ids the groups name, for their labels. */
export function templateIdsOf(groups: SearchItem[]): string[] {
	return [...new Set(groups.map(group => group[TEMPLATE_FIELD]).filter(Boolean).map(String))].sort();
}
