import type { RowId } from '../types';


/** Why the drag handles are off; each maps to a `datatable.*` tooltip key. */
export type ManualSortLock = 'readOnly' | 'permission' | 'editing' | 'filtered';

export type ManualSortLockInput = {
	/** The table may update rows: `update` is a capability (the host is in update mode). */
	canUpdate: boolean,
	/** The update capability is entitlement-locked. */
	updateLocked: boolean,
	/** A row editor or the insert row is open. */
	isEditing: boolean,
	/** The applied search differs from the page's own: a column sort or a filter is in effect. */
	isSortedOrFiltered: boolean,
};

/**
 * The first reason a drag would be wrong, or `null` when rows may be dragged. A sorted or filtered
 * table shows a subset in an order the server chose, so a dropped position would be ambiguous.
 */
export function manualSortLock(input: ManualSortLockInput): ManualSortLock | null {
	if (!input.canUpdate) {
		return 'readOnly';
	}
	if (input.updateLocked) {
		return 'permission';
	}
	if (input.isEditing) {
		return 'editing';
	}
	return input.isSortedOrFiltered ? 'filtered' : null;
}

export const manualSortLockKeys: Record<ManualSortLock, { key: string, defaultValue: string }> = {
	readOnly: { key: 'datatable.sortLockedReadOnly', defaultValue: 'Rows can be reordered only in edit mode' },
	permission: {
		key: 'datatable.sortLockedPermission', defaultValue: 'You do not have permission to reorder these rows',
	},
	editing: { key: 'datatable.sortLockedEditing', defaultValue: 'Finish the row being edited first' },
	filtered: {
		key: 'datatable.sortLockedFiltered', defaultValue: 'Clear the column sort and filters to reorder rows',
	},
};

/**
 * The displayed ids after moving `activeId` onto `overId`'s slot, or `null` when nothing moved
 * (dropped on itself, outside the rows, or on an id that is not displayed).
 */
export function reorderRowIds(order: RowId[], activeId: RowId, overId: RowId | null | undefined): string[] | null {
	if (overId == null) {
		return null;
	}
	const ids = order.map(String);
	const from = ids.indexOf(String(activeId));
	const to = ids.indexOf(String(overId));
	if (from < 0 || to < 0 || from === to) {
		return null;
	}
	const next = [...ids];
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	return next;
}

/** A stable comparison key for a search graph; `undefined` and an empty graph are the same. */
export function searchGraphKey(graph: unknown): string {
	if (graph == null || (typeof graph === 'object' && Object.keys(graph).length === 0)) {
		return '';
	}
	return JSON.stringify(graph);
}
