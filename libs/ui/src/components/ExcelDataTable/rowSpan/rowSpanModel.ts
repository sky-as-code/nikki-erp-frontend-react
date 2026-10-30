import { actionColumnKey } from '../actionColumns/actionColumnsModel';
import { rowIdOf } from '../types';

import type { RowSpanConfig } from './rowSpanSchema';
import type { ActionColumn, RowId, SearchItem } from '../types';


/** Every flat row names its group; the sub index is `-1` on the one row of a group without sub-rows. */
export const ROW_SPAN_GROUP_KEY = '__row_span_group';
export const ROW_SPAN_SUB_KEY = '__row_span_sub';

/** The column of per-sub-row controls (sub-row Delete; Add/Discard of the sub-row insert line). */
export const SUB_ROW_ACTIONS_COLUMN: ActionColumn = { key: 'rowSpanSubRow', actions: [], width: 112 };
export const SUB_ROW_ACTIONS_KEY = actionColumnKey(SUB_ROW_ACTIONS_COLUMN.key);
/** Placement keys of the two non-column cells of a row. */
export const ROW_SPAN_INDEX_CELL = '@rowSpan:index';
export const ROW_SPAN_FILLER_CELL = '@rowSpan:filler';

/** Where a flat row sits in its group. */
export type RowSpanPlace = {
	groupId: RowId,
	group: SearchItem,
	/** `-1`: the group has no sub-rows and this row only carries its group cells. */
	subIndex: number,
	subCount: number,
};

export type RowSpanGroup = { groupId: RowId, group: SearchItem, rowIds: RowId[] };

export type FlatRowSpanData = {
	rows: SearchItem[],
	places: Map<RowId, RowSpanPlace>,
	groups: RowSpanGroup[],
};

export function flatRowId(groupId: RowId, subIndex: number): string {
	return `${groupId}:${subIndex < 0 ? '-' : subIndex}`;
}

export function subRowsOf(group: SearchItem, config: RowSpanConfig): SearchItem[] {
	const subs = group[config.singleField];
	return Array.isArray(subs) ? subs as SearchItem[] : [];
}

/**
 * One flat row per sub-row, carrying its group's own fields (so a sub-row form sees them, e.g. the
 * template a nested attribute depends on) and the group's etag. A group without sub-rows keeps one
 * row for its group cells. Each item of `items` is one group: equal `rowSpanField` values never merge.
 */
export function flattenRowSpanItems(items: SearchItem[], config: RowSpanConfig): FlatRowSpanData {
	const rows: SearchItem[] = [];
	const places = new Map<RowId, RowSpanPlace>();
	const groups: RowSpanGroup[] = [];
	items.forEach((group, groupIndex) => {
		const groupId = rowIdOf(group, groupIndex);
		const { [config.singleField]: _subs, ...base } = group;
		const subs = subRowsOf(group, config);
		const subCount = subs.length;
		const entries = subCount > 0 ? subs.map((sub, index) => ({ sub, index })) : [{ sub: {}, index: -1 }];
		const rowIds = entries.map(({ sub, index }) => {
			const id = flatRowId(groupId, index);
			const { id: _subId, etag: _subEtag, ...subValues } = sub as SearchItem;
			rows.push({
				...base, ...subValues, id, etag: group.etag, [ROW_SPAN_GROUP_KEY]: groupId, [ROW_SPAN_SUB_KEY]: index,
			});
			places.set(id, { groupId, group, subIndex: index, subCount });
			return id;
		});
		groups.push({ groupId, group, rowIds });
	});
	return { rows, places, groups };
}

function pickNested(values: Record<string, unknown>, config: RowSpanConfig): Record<string, unknown> {
	return Object.fromEntries(Object.entries(values).filter(([key]) => config.nestedFields.includes(key)));
}

/** A group's (or a flat write's) own fields: no nested field, no id/etag, no row-span bookkeeping. */
export function groupOwnFields(values: Record<string, unknown>, config: RowSpanConfig): Record<string, unknown> {
	return Object.fromEntries(Object.entries(values).filter(([key]) => (
		!config.nestedFields.includes(key) && key !== 'id' && key !== 'etag'
		&& key !== ROW_SPAN_GROUP_KEY && key !== ROW_SPAN_SUB_KEY && key !== config.singleField
	)));
}

/**
 * A flat row's write (`{id, etag, ...changed}`) as its whole group, re-nested: the group item as
 * given — its `id`, `etag` and every other key kept — with group fields changed in place and nested
 * fields changed on that sub-row (the sub-row's own keys, e.g. a saved line id, kept).
 */
export function groupUpdateOf(
	place: RowSpanPlace, changed: Record<string, unknown>, config: RowSpanConfig,
): SearchItem {
	const subs = [...subRowsOf(place.group, config)];
	const nested = pickNested(changed, config);
	if (place.subIndex >= 0 && Object.keys(nested).length > 0) {
		subs[place.subIndex] = { ...subs[place.subIndex], ...nested };
	}
	return { ...place.group, ...groupOwnFields(changed, config), [config.singleField]: subs };
}

/** The group with one more sub-row, built from the sub-row insert line's values. */
export function groupWithSubAdded(
	group: SearchItem, values: Record<string, unknown>, config: RowSpanConfig,
): SearchItem {
	return { ...group, [config.singleField]: [...subRowsOf(group, config), pickNested(values, config)] };
}

export function groupWithSubRemoved(place: RowSpanPlace, config: RowSpanConfig): SearchItem {
	const subs = subRowsOf(place.group, config).filter((_sub, index) => index !== place.subIndex);
	return { ...place.group, [config.singleField]: subs };
}

/** The main insert row adds a group: its own fields, and no sub-row yet. */
export function newGroupOf(values: Record<string, unknown>, config: RowSpanConfig): Record<string, unknown> {
	return { ...groupOwnFields(values, config), [config.singleField]: [] };
}

/** The fields an insert line takes input for: the group's own fields (main row) or the nested ones (sub-row). */
export function rowSpanInsertFields(fields: string[], config: RowSpanConfig, isSubRow: boolean): string[] {
	return fields.filter(field => config.nestedFields.includes(field) === isSubRow);
}

export type CellSpan = { skip: true } | { skip: false, rowSpan?: number, blank?: boolean };

const ownCell: CellSpan = { skip: false };
const blankCell: CellSpan = { skip: false, blank: true };
const skippedCell: CellSpan = { skip: true };

/** A `<td>`'s `rowSpan` attribute for the span, none for a one-row cell. */
export function rowSpanAttrs(span: CellSpan): { rowSpan?: number } {
	return !span.skip && span.rowSpan ? { rowSpan: span.rowSpan } : {};
}

/** How many rows a group's own cells span: its sub-rows (at least one) plus the sub-row insert line. */
export function groupRowSpan(place: RowSpanPlace, withSubInsert: boolean): number {
	return Math.max(place.subCount, 1) + (withSubInsert ? 1 : 0);
}

/**
 * A cell of a flat row: a nested column (and the sub-row actions) belongs to the sub-row, blank on a
 * group without sub-rows; every other cell — group fields, custom action columns, index, filler with
 * the group Delete — is drawn once, on the group's first row, spanning the group.
 */
export function cellSpanOf(
	place: RowSpanPlace | undefined, cellKey: string, config: RowSpanConfig, withSubInsert: boolean,
): CellSpan {
	if (!place) {
		return ownCell;
	}
	if (config.nestedFields.includes(cellKey) || cellKey === SUB_ROW_ACTIONS_KEY) {
		return place.subIndex < 0 ? blankCell : ownCell;
	}
	if (place.subIndex > 0) {
		return skippedCell;
	}
	const rowSpan = groupRowSpan(place, withSubInsert);
	return rowSpan > 1 ? { skip: false, rowSpan } : ownCell;
}

/**
 * Action columns placed after a nested field move after the last one: the nested columns must stay
 * contiguous for the sub-row insert line's cells. The sub-row actions column goes last.
 */
export function rowSpanActionColumns(
	actionColumns: ActionColumn[] | undefined, config: RowSpanConfig, withSubRowActions: boolean,
): ActionColumn[] {
	const last = config.nestedFields[config.nestedFields.length - 1];
	const columns = (actionColumns ?? []).map(column => (
		column.afterField && config.nestedFields.includes(column.afterField) ? { ...column, afterField: last } : column
	));
	return withSubRowActions ? [...columns, SUB_ROW_ACTIONS_COLUMN] : columns;
}
