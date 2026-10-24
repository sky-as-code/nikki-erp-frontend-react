import { isLineChanged, setLineAttribute, setLineValues } from './templateConfigDrafts';

import type { AttributeCatalogue } from './attributeCatalogue';
import type { AttributeLineDraft, TemplateConfigDraft } from './templateConfigDrafts';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ActionColumn, SearchData, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


export const ATTRIBUTE_FIELD = 'attribute_id';
export const VALUES_FIELD = 'value_ids';
export const MODE_FIELD = 'variant_creation';
/** The saved line's own id, which the extra-price page filters by. Not a column. */
export const LINE_ID_FIELD = 'line_id';
export const LINE_COLUMNS = [ATTRIBUTE_FIELD, VALUES_FIELD, MODE_FIELD];

/** A draft row has no etag of its own: its writes are drafts, saved with the template's etag. */
const DRAFT_ETAG = 'draft';
const NOT_SORTABLE = { is_sortable: false, is_filterable: false };

/**
 * The lines table's columns, named after the backend line schema (`inventory_product_template_attribute`),
 * whose validation a row form loads by that name. `value_ids` and `variant_creation` are virtual:
 * the line keeps its values in another table and its mode as `variant_creation_snapshot`. Nothing
 * is sortable or filterable, because the rows are the template's draft, not a search.
 */
export const LINE_TABLE_SCHEMA: dyn.ModelSchema = {
	name: 'inventory_product_template_attribute',
	fields: {
		// Set once, in the insert row: another attribute is another line, never an edit of this one.
		[ATTRIBUTE_FIELD]: {
			name: ATTRIBUTE_FIELD,
			label: {},
			data_type: { name: 'ulid' },
			is_required_for_create: true,
			no_update: true,
			...NOT_SORTABLE,
		},
		[VALUES_FIELD]: {
			name: VALUES_FIELD, label: {}, data_type: { name: 'ulid', is_array: true }, ...NOT_SORTABLE,
		},
		[MODE_FIELD]: {
			name: MODE_FIELD,
			label: {},
			data_type: { name: 'enumString', options: { enumValues: ['instant', 'dynamic', 'never'] } },
			is_computed: true,
			is_virtual: true,
			...NOT_SORTABLE,
		},
	},
};

/** The mode a line creates variants with: the snapshot it was applied with, else its attribute's mode. */
export function lineMode(line: AttributeLineDraft, catalogue: AttributeCatalogue): string | undefined {
	return line.snapshot ?? catalogue.attributes.get(line.attributeId)?.mode;
}

/** One table row per line, keyed by the line's stable draft key: an unsaved line has no id yet. */
export function linesToRows(draft: TemplateConfigDraft, catalogue: AttributeCatalogue): SearchItem[] {
	return draft.lines.map(line => ({
		id: line.key,
		etag: DRAFT_ETAG,
		[ATTRIBUTE_FIELD]: line.attributeId,
		[VALUES_FIELD]: [...line.valueIds],
		[MODE_FIELD]: lineMode(line, catalogue) ?? null,
		[LINE_ID_FIELD]: line.id ?? null,
	}));
}

export function rowsToSearchData(items: SearchItem[]): SearchData {
	return {
		items, total: items.length, page: 0, size: Math.max(items.length, 1),
		desired_fields: LINE_COLUMNS, masked_fields: [], schema_etag: '',
	};
}

/**
 * A row write of the table (`{id, etag, ...changed}`) applied to the draft. The attribute goes
 * first: choosing another one clears the values, and the values sent with it then belong to it.
 */
export function applyRowUpdate(draft: TemplateConfigDraft, values: Record<string, unknown>): TemplateConfigDraft {
	const key = String(values.id ?? '');
	let next = draft;
	if (typeof values[ATTRIBUTE_FIELD] === 'string') {
		next = setLineAttribute(next, key, values[ATTRIBUTE_FIELD]);
	}
	if (Array.isArray(values[VALUES_FIELD])) {
		next = setLineValues(next, key, values[VALUES_FIELD].map(String));
	}
	return next;
}

/** An insert row's values, or `null` while it names no attribute. */
export function readNewLine(values: Record<string, unknown>): { attributeId: string, valueIds: string[] } | null {
	const attributeId = values[ATTRIBUTE_FIELD];
	if (typeof attributeId !== 'string' || attributeId === '') {
		return null;
	}
	const valueIds = Array.isArray(values[VALUES_FIELD]) ? values[VALUES_FIELD].map(String) : [];
	return { attributeId, valueIds };
}

export function isNewLineRow(saved: TemplateConfigDraft, row: SearchItem): boolean {
	return !saved.lines.some(line => line.key === row.id);
}

export function isChangedLineRow(saved: TemplateConfigDraft, draft: TemplateConfigDraft, row: SearchItem): boolean {
	const line = draft.lines.find(other => other.key === row.id);
	return !!line && isLineChanged(saved, line);
}

/** The extra-price list of one saved line, in the inventory module whichever module shows the template. */
export const EXTRA_PRICE_ROUTE = '/inventory/inventory_product_template_attribute_value';

export function configureHref(lineId: string): string {
	const graph = { if: ['template_attribute_id', '=', lineId], order: [['sequence', 'asc']] };
	return `${EXTRA_PRICE_ROUTE}?initialGraph=${encodeURIComponent(JSON.stringify(graph))}`;
}

/**
 * Why Configure is off for a row, or `false`. The extra-price page edits the SAVED value rows of a
 * SAVED line, and a line not saved yet has none. Configure is offered outside edit mode only
 * (`configureColumns`), where every line is saved, so this is a guard rather than a state users see.
 */
export function configureDisabledReason(row: SearchItem, saveFirst: string): string | false {
	const lineId = row[LINE_ID_FIELD];
	return typeof lineId !== 'string' || lineId === '' ? saveFirst : false;
}

/**
 * The Configure column. None in edit mode: Configure leaves the page, which would discard the unsaved
 * edits, so it is hidden there rather than disabled (as is View variants above the table).
 */
export function configureColumns(
	editable: boolean, labels: { configure: string, saveFirst: string }, entitlement: ActionColumnEntitlement,
): ActionColumn[] {
	if (editable) {
		return [];
	}
	return [{
		key: 'configure',
		afterField: VALUES_FIELD,
		actions: [{
			key: 'configure',
			label: labels.configure,
			type: 'action_link',
			entitlement,
			href: (row: SearchItem) => configureHref(String(row[LINE_ID_FIELD] ?? '')),
			disabled: (row: SearchItem) => configureDisabledReason(row, labels.saveFirst),
		}],
	}];
}

type ActionColumnEntitlement = ActionColumn['actions'][number]['entitlement'];
