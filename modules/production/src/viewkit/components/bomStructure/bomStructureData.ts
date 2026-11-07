import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { useLocalize } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import type * as dyn from '@nikkierp/common/dynamicModel';


export const BOM_VERSION = 'mftr_bom_version';
export const BOM_LINE = 'mftr_bom_line';
export const BOM_OPERATION = 'mftr_bom_operation';
const PAGE_SIZE = 200;

export type Row = Record<string, unknown>;
export type Option = { value: string, label: string };

/** A column of the structure: how it is shown and, in the editor, how it is typed. */
export type ColumnSpec = {
	field: string,
	kind: 'relation' | 'number' | 'text',
	required?: boolean,
	/** Relation: the target schema, its label field and an optional fixed graph for the options. */
	schema?: string,
	labelField?: string,
	graph?: dyn.SearchNode,
};

export const LINE_COLUMNS: ColumnSpec[] = [
	{ field: 'sequence', kind: 'number' },
	{
		field: 'product_variant_id', kind: 'relation', required: true, schema: 'inventory_product_variant',
		labelField: 'display_name', graph: { if: ['variant_kind', '=', 'complete'] },
	},
	{ field: 'quantity', kind: 'number', required: true },
	{ field: 'uom_id', kind: 'relation', schema: 'essential_uom', labelField: 'name' },
	{ field: 'bom_operation_id', kind: 'relation', schema: BOM_OPERATION, labelField: 'name' },
];

export const OPERATION_COLUMNS: ColumnSpec[] = [
	{ field: 'sequence', kind: 'number', required: true },
	{ field: 'name', kind: 'text', required: true },
	{ field: 'work_center_id', kind: 'relation', required: true, schema: 'mftr_work_center', labelField: 'name' },
	{ field: 'duration_expected', kind: 'number' },
	{ field: 'instructions', kind: 'text' },
];

/** The version the section shows: the newest draft (editable) or else the active one (read-only). */
export function pickVersion(versions: Row[], activeVersionId: unknown): Row | undefined {
	const drafts = versions.filter(version => version.status === 'draft');
	if (drafts.length > 0) {
		return drafts.sort((a, b) => Number(b.version_no ?? 0) - Number(a.version_no ?? 0))[0];
	}
	return versions.find(version => version.id === activeVersionId);
}

type SearchRows = (schema: string, graph: dyn.SearchNode | undefined, fields: string[]) => Promise<Row[]>;

export function useSearchRows(): SearchRows {
	const bus = useCommandBus();
	return React.useCallback(async (schema, graph, fields) => {
		const response = await bus.publish<dyn.RestSearchResponse<Row>>({
			name: resourceCommands(schema).SEARCH,
			payload: { page: 0, size: PAGE_SIZE, fields, graph },
		});
		return response.result?.data?.items ?? [];
	}, [bus]);
}

/**
 * Options of every relation column. Fixed targets load once; the operations, which belong to the version,
 * reload when it changes. Each column's options merge into the state on their own, so a slower load never
 * overwrites, or is overwritten by, another column's.
 */
export function useRelationOptions(columns: ColumnSpec[], versionId: string | undefined): Record<string, Option[]> {
	const search = useSearchRows();
	// The localizer is recreated each render; a ref keeps the loads from re-running because of it.
	const localizeNow = useLocalize();
	const localize = React.useRef(localizeNow);
	localize.current = localizeNow;
	const [options, setOptions] = React.useState<Record<string, Option[]>>({});
	const load = React.useCallback(async (column: ColumnSpec, graph: dyn.SearchNode | undefined) => {
		const rows = await search(column.schema ?? '', graph, ['id', column.labelField ?? 'id']);
		const loaded = rows.map(row => {
			const raw = row[column.labelField ?? 'id'];
			const label = raw && typeof raw === 'object' ? localize.current(raw as dyn.ModelSchemaLangJson) : undefined;
			return { value: String(row.id), label: label || labelOf(raw, row.id) };
		});
		setOptions(previous => ({ ...previous, [column.field]: loaded }));
	}, [search]);
	React.useEffect(() => {
		columns.filter(column => column.kind === 'relation' && column.schema && column.schema !== BOM_OPERATION)
			.forEach(column => void load(column, column.graph));
	}, [columns, load]);
	React.useEffect(() => {
		const column = columns.find(candidate => candidate.schema === BOM_OPERATION);
		if (column && versionId) {
			void load(column, { if: ['bom_version_id', '=', versionId] });
		}
	}, [columns, versionId, load]);
	return options;
}

export function labelOf(value: unknown, fallback: unknown): string {
	if (value && typeof value === 'object') {
		const texts = Object.values(value as Record<string, unknown>).filter(text => typeof text === 'string');
		return String(texts[0] ?? fallback);
	}
	return String(value ?? fallback ?? '');
}

export type RowWrite = { kind: 'create' | 'update' | 'delete', payload: Row };

/** What saving the edited rows sends: deletes for dropped rows, updates for changed ones, creates for new ones. */
export function diffRows(original: Row[], edited: Row[], columns: ColumnSpec[], versionId: string): RowWrite[] {
	const writes: RowWrite[] = [];
	const keptIds = new Set(edited.map(row => row.id).filter(Boolean));
	for (const row of original) {
		if (!keptIds.has(row.id)) {
			writes.push({ kind: 'delete', payload: { id: row.id, etag: row.etag } });
		}
	}
	const byId = new Map(original.map(row => [row.id, row]));
	for (const row of edited) {
		const values = Object.fromEntries(columns.map(column => [column.field, normalise(row[column.field])]));
		const before = row.id ? byId.get(row.id) : undefined;
		if (!before) {
			writes.push({ kind: 'create', payload: { ...values, bom_version_id: versionId } });
			continue;
		}
		const changed = columns.filter(column => normalise(before[column.field]) !== values[column.field]);
		if (changed.length > 0) {
			const delta = Object.fromEntries(changed.map(column => [column.field, values[column.field]]));
			writes.push({ kind: 'update', payload: { id: before.id, etag: before.etag, ...delta } });
		}
	}
	return writes;
}

function normalise(value: unknown): unknown {
	if (value === '' || value === undefined) {
		return null;
	}
	return typeof value === 'number' ? String(value) : value;
}
