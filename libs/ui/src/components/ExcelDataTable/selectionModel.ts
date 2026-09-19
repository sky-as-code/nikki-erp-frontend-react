import type { RowId } from './types';


/**
 * The selection as an ordered set plus the two ids Excel-style gestures pivot on.
 *
 * `anchorId` is where a Shift range starts: the row of the last plain or Ctrl click. `lastId` is
 * the most recent row touched by any gesture, which is what the arrow keys move from and what
 * survives when a multi-selection collapses to one row.
 */
export type SelectionState = {
	ids: RowId[],
	anchorId: RowId | null,
	lastId: RowId | null,
};

export type SelectionModifiers = { ctrl?: boolean, shift?: boolean };

export function emptySelection(): SelectionState {
	return { ids: [], anchorId: null, lastId: null };
}

export function isSelected(state: SelectionState, id: RowId): boolean {
	return state.ids.includes(id);
}

export function selectSingle(id: RowId): SelectionState {
	return { ids: [id], anchorId: id, lastId: id };
}

function toggle(state: SelectionState, id: RowId): SelectionState {
	const ids = isSelected(state, id) ? state.ids.filter(other => other !== id) : [...state.ids, id];
	return { ids, anchorId: id, lastId: id };
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
 * Applies a click on the row handle (the first gray cell):
 * plain → that row only; Ctrl → toggle it, keeping the rest; Shift → the range from the anchor
 * to it, replacing the rest; Ctrl+Shift → that range added to the rest.
 *
 * `order` is the rows as displayed, so the range follows the current sort.
 */
export function selectWithModifiers(
	state: SelectionState, order: RowId[], id: RowId, mods: SelectionModifiers,
): SelectionState {
	if (mods.shift) {
		const anchor = state.anchorId ?? state.lastId ?? id;
		const range = rangeBetween(order, anchor, id);
		return {
			ids: mods.ctrl ? addAll(state.ids, range) : range,
			anchorId: anchor,
			lastId: id,
		};
	}
	return mods.ctrl ? toggle(state, id) : selectSingle(id);
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
