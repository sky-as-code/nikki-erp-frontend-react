import { rowSpanSchemaFromJson } from '@nikkierp/ui/components/ExcelDataTable';

import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { RecordSearchScope } from '@nikkierp/ui/components/form';


export const MOVES_TEST_ID_PREFIX = 'inventory.stockTransferMoves';

export const VARIANT_FIELD = 'product_variant_id';
export const QUANTITY_FIELD = 'demand_quantity';
export const UOM_FIELD = 'uom_id';

/** The table's columns, in order: one row per move. */
export const MOVE_GROUP_COLUMNS = [VARIANT_FIELD, QUANTITY_FIELD, UOM_FIELD];

/** Where each column's label comes from in a read row (`{edge}.{field}`), as `edge_labels` names it. */
export const MOVE_EDGE_LABELS: Record<string, string> = {
	product_variant: 'display_name',
	uom: 'name',
};

/**
 * Only transaction-eligible variants are offered: the backend refuses a new move on an archived,
 * discontinued or base variant (`assertVariantTransactable`), so offering one would only fail the save.
 */
export const MOVE_VARIANT_SEARCH_SCOPE: Record<string, RecordSearchScope> = {
	[VARIANT_FIELD]: { graph: { if: ['is_transaction_eligible', '=', true] } },
};

/**
 * One move as the table edits it: the variant, its demand and its unit. The table is local (the moves
 * ride the transfer's own write), so the schema lives here; its `$ref` labels resolve in the inventory
 * namespace.
 */
export const MOVE_GROUP_SCHEMA = rowSpanSchemaFromJson({
	name: 'inventory_stock_transfer_move_group',
	fields: [
		{ name: 'id', data_type: 'ulid', is_primary_key: true },
		{ name: 'etag', data_type: 'string', is_auto_generated: true },
		{
			name: VARIANT_FIELD, label: { $ref: 'fields.product_variant_id' }, data_type: 'ulid',
			is_required_for_create: true,
		},
		{
			name: QUANTITY_FIELD, label: { $ref: 'fields.demand_quantity' },
			data_type: { name: 'decimal', options: { scale: 4 } }, is_required_for_create: true,
		},
		// "Unit", not the field's "Unit of measure": the column shows the unit's name.
		{ name: UOM_FIELD, label: { $ref: 'fields.uom_name' }, data_type: 'ulid' },
	],
	edges_to: [
		{ edge: 'product_variant', dest_schema: 'inventory_product_variant', key_map: { [VARIANT_FIELD]: 'id' } },
		{ edge: 'uom', dest_schema: 'essential_uom', key_map: { [UOM_FIELD]: 'id' } },
	],
});

/** The transfer's moves; the labelled read adds each variant's and unit's label. */
export const SAVED_MOVE_FIELDS = ['id', 'etag', 'sequence', VARIANT_FIELD, UOM_FIELD, QUANTITY_FIELD, 'status'];

/** The saved moves as rows, in `sequence` order, each carrying its labelled edges. */
export function groupSavedMoves(moves: SearchItem[]): SearchItem[] {
	return [...moves]
		.sort((left, right) => Number(left.sequence ?? 0) - Number(right.sequence ?? 0))
		.map(move => ({
			id: move.id,
			etag: move.etag,
			[VARIANT_FIELD]: move[VARIANT_FIELD] ?? null,
			product_variant: move.product_variant,
			[QUANTITY_FIELD]: move[QUANTITY_FIELD],
			[UOM_FIELD]: move[UOM_FIELD] ?? null,
			uom: move.uom,
		}));
}

/**
 * Puts a variant name where a read cell looks for it (`product_variant.display_name`), for a row
 * whose variant the labelled read never saw: a drafted move, or a saved one whose variant was changed.
 */
export function withVariantLabels(rows: SearchItem[], names: Map<string, unknown>): SearchItem[] {
	return rows.map((row) => {
		const name = names.get(String(row[VARIANT_FIELD] ?? ''));
		return name === undefined ? row : { ...row, product_variant: { display_name: name } };
	});
}

/** Variant ids of rows that carry no label for their variant. */
export function unlabelledVariantIds(rows: SearchItem[]): string[] {
	const ids = rows
		.filter(row => row[VARIANT_FIELD] && (row.product_variant as SearchItem | undefined)?.display_name == null)
		.map(row => String(row[VARIANT_FIELD]));
	return [...new Set(ids)].sort();
}
