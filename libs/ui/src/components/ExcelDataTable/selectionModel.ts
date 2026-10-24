import type { RowId } from './types';


/**
 * The selection as an ordered set plus the two ids Excel-style gestures pivot on.
 *
 * `anchorId` is where a Shift range starts: the row of the last index-cell click, or where a drag
 * began. `lastId` is the most recent row touched by any gesture, which is what the arrow keys move
 * from and what survives when a multi-selection collapses to one row.
 */
export type SelectionState = {
	ids: RowId[],
	anchorId: RowId | null,
	lastId: RowId | null,
};

/**
 * @deprecated Ctrl/Meta no longer selects and Shift ranges belong to the index cell only.
 * Kept so card views that still pass modifiers to `selectRow` compile; they are ignored.
 */
export type SelectionModifiers = { ctrl?: boolean, shift?: boolean };

/**
 * `single` keeps at most one row selected. `none` selects nothing: clicks, the index cell, the
 * arrow keys and select-all are inert, for a table whose rows are only edited in place.
 */
export type SelectionMode = 'single' | 'multiple' | 'none';

/** Whether a drag over index cells adds its range to the selection or takes it out. */
export type DragMode = 'add' | 'remove';

export function emptySelection(): SelectionState {
	return { ids: [], anchorId: null, lastId: null };
}

export function isSelected(state: SelectionState, id: RowId): boolean {
	return state.ids.includes(id);
}

export function selectSingle(id: RowId): SelectionState {
	return { ids: [id], anchorId: id, lastId: id };
}

/** A data or filler cell click: that row alone, whatever was selected, never a deselect. */
export function selectOnly(id: RowId): SelectionState {
	return selectSingle(id);
}

/** A selection preset by the caller, e.g. the value a picker opens on. */
export function seedSelection(ids: RowId[], mode: SelectionMode = 'multiple'): SelectionState {
	if (mode === 'none') {
		return emptySelection();
	}
	const seeded = mode === 'single' ? ids.slice(0, 1) : ids;
	const last = seeded.length > 0 ? seeded[seeded.length - 1] : null;
	return { ids: seeded, anchorId: seeded[0] ?? null, lastId: last };
}

function rangeBetween(order: RowId[], from: RowId, to: RowId): RowId[] {
	const fromIndex = order.indexOf(from);
	const toIndex = order.indexOf(to);
	if (fromIndex < 0 || toIndex < 0) {
		return [to];
	}
	const [start, end] = fromIndex <= toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
	return order.slice(start, end + 1);
}

function addAll(ids: RowId[], extra: RowId[]): RowId[] {
	return [...ids, ...extra.filter(id => !ids.includes(id))];
}

/**
 * An index-cell click (or Space on it). `multiple`: adds the row, or removes it when selected,
 * keeping the rest. `single`: that row only, or nothing when it was the selected one.
 */
export function toggleIndex(state: SelectionState, id: RowId, mode: SelectionMode = 'multiple'): SelectionState {
	if (mode === 'single') {
		return isSelected(state, id) ? emptySelection() : selectSingle(id);
	}
	const ids = isSelected(state, id) ? state.ids.filter(other => other !== id) : [...state.ids, id];
	return { ids, anchorId: id, lastId: id };
}

/**
 * Shift+click on an index cell: the rows from the anchor to `id` are added to the selection. The
 * anchor stays, so successive Shift clicks pivot on the same row. `single` treats it as a click.
 *
 * `order` is the rows as displayed, so the range follows the current sort.
 */
export function rangeIndex(
	state: SelectionState, order: RowId[], id: RowId, mode: SelectionMode = 'multiple',
): SelectionState {
	if (mode === 'single') {
		return toggleIndex(state, id, mode);
	}
	const anchor = state.anchorId ?? state.lastId ?? id;
	return { ids: addAll(state.ids, rangeBetween(order, anchor, id)), anchorId: anchor, lastId: id };
}

/**
 * The selection while dragging over index cells: the range `startId`…`overId` added to (or removed
 * from) `baseIds`, the selection as it was when the drag began. Recomputed from that base on every
 * move, so dragging back shrinks the range instead of leaving rows behind.
 */
export function dragRange(
	baseIds: RowId[], order: RowId[], startId: RowId, overId: RowId, mode: DragMode,
): SelectionState {
	const range = rangeBetween(order, startId, overId);
	const ids = mode === 'add' ? addAll(baseIds, range) : baseIds.filter(id => !range.includes(id));
	return { ids, anchorId: startId, lastId: overId };
}

/**
 * Moves a single selection by `delta` rows. A multi-selection collapses to its last row first,
 * so arrow keys always leave exactly one row selected. With nothing selected, the first row is.
 */
export function moveSelection(state: SelectionState, order: RowId[], delta: number): SelectionState {
	if (order.length === 0) {
		return emptySelection();
	}
	if (state.lastId === null) {
		return selectSingle(order[0]);
	}
	const current = Math.max(0, order.indexOf(state.lastId));
	const next = Math.min(order.length - 1, Math.max(0, current + delta));
	return selectSingle(order[next]);
}

/** Drops ids no longer displayed, e.g. after a refresh removed rows. */
export function pruneSelection(state: SelectionState, order: RowId[]): SelectionState {
	const ids = state.ids.filter(id => order.includes(id));
	if (ids.length === state.ids.length) {
		return state;
	}
	const keep = (id: RowId | null) => (id !== null && order.includes(id) ? id : null);
	return { ids, anchorId: keep(state.anchorId), lastId: keep(state.lastId) };
}

/** Every given row, e.g. the header's select-all over the rows loaded. */
export function selectAll(ids: RowId[]): SelectionState {
	return seedSelection([...ids]);
}

export type SelectionCoverage = 'none' | 'some' | 'all';

/** How much of `ids` is selected: what the header's select-all checkbox shows. */
export function selectionStateOf(state: SelectionState, ids: RowId[]): SelectionCoverage {
	const selectedCount = ids.filter(id => isSelected(state, id)).length;
	if (selectedCount === 0) {
		return 'none';
	}
	return selectedCount === ids.length ? 'all' : 'some';
}
