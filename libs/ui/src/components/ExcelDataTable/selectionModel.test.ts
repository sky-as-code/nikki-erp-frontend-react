import { describe, expect, it } from 'vitest';

import {
	dragRange, emptySelection, isSelected, moveSelection, pruneSelection, rangeIndex, seedSelection, selectAll,
	selectOnly, selectSingle, selectionStateOf, toggleIndex,
} from './selectionModel';


const order = ['a', 'b', 'c', 'd', 'e'];

describe('toggleIndex', () => {
	it('adds an unselected row, keeping the rest, and anchors on it', () => {
		const state = toggleIndex(selectSingle('a'), 'c');
		expect(state.ids).toEqual(['a', 'c']);
		expect(state.anchorId).toBe('c');
		expect(state.lastId).toBe('c');
	});

	it('removes a selected row, keeping the rest', () => {
		const state = toggleIndex(seedSelection(['a', 'c']), 'a');
		expect(state.ids).toEqual(['c']);
		expect(state.lastId).toBe('a');
	});

	it('selects only that row in single mode, or nothing when it was the selected one', () => {
		expect(toggleIndex(selectSingle('a'), 'c', 'single').ids).toEqual(['c']);
		expect(toggleIndex(selectSingle('a'), 'a', 'single')).toEqual(emptySelection());
	});
});

describe('rangeIndex', () => {
	it('adds the range from the anchor to the row to the selection', () => {
		const base = toggleIndex(toggleIndex(emptySelection(), 'e'), 'b');
		const state = rangeIndex(base, order, 'd');
		expect(state.ids).toEqual(['e', 'b', 'c', 'd']);
		expect(state.anchorId).toBe('b');
		expect(state.lastId).toBe('d');
	});

	it('follows the display order backwards too', () => {
		expect(rangeIndex(selectSingle('d'), order, 'b').ids).toEqual(['d', 'b', 'c']);
	});

	it('selects the clicked row when there is no anchor', () => {
		expect(rangeIndex(emptySelection(), order, 'c').ids).toEqual(['c']);
	});

	it('is a plain index click in single mode', () => {
		expect(rangeIndex(selectSingle('a'), order, 'd', 'single').ids).toEqual(['d']);
		expect(rangeIndex(selectSingle('d'), order, 'd', 'single').ids).toEqual([]);
	});
});

describe('dragRange', () => {
	it('adds the start…over range to the base', () => {
		const state = dragRange(['e'], order, 'b', 'd', 'add');
		expect(state.ids).toEqual(['e', 'b', 'c', 'd']);
		expect(state.anchorId).toBe('b');
		expect(state.lastId).toBe('d');
	});

	it('shrinks when dragging back, since it recomputes from the base', () => {
		expect(dragRange([], order, 'b', 'd', 'add').ids).toEqual(['b', 'c', 'd']);
		expect(dragRange([], order, 'b', 'c', 'add').ids).toEqual(['b', 'c']);
		expect(dragRange([], order, 'b', 'a', 'add').ids).toEqual(['a', 'b']);
	});

	it('removes the range from the base in remove mode', () => {
		expect(dragRange(order, order, 'b', 'd', 'remove').ids).toEqual(['a', 'e']);
	});

	it('at the start row equals a toggle of that row', () => {
		expect(dragRange(['a'], order, 'c', 'c', 'add').ids).toEqual(toggleIndex(selectSingle('a'), 'c').ids);
		expect(dragRange(['a', 'c'], order, 'c', 'c', 'remove').ids).toEqual(['a']);
	});
});

describe('selectOnly', () => {
	it('leaves exactly that row selected, even when it already was', () => {
		expect(selectOnly('c')).toEqual({ ids: ['c'], anchorId: 'c', lastId: 'c' });
		expect(selectOnly('a').ids).toEqual(['a']);
	});
});

describe('moveSelection', () => {
	it('moves a single selection and clamps at both ends', () => {
		expect(moveSelection(selectSingle('a'), order, -1).ids).toEqual(['a']);
		expect(moveSelection(selectSingle('a'), order, 1).ids).toEqual(['b']);
		expect(moveSelection(selectSingle('e'), order, 1).ids).toEqual(['e']);
	});

	it('collapses a multi-selection to the last touched row before moving', () => {
		const multi = toggleIndex(selectSingle('a'), 'd');
		expect(moveSelection(multi, order, 1).ids).toEqual(['e']);
	});

	it('selects the first row when nothing is selected', () => {
		expect(moveSelection(emptySelection(), order, 1).ids).toEqual(['a']);
		expect(moveSelection(emptySelection(), [], 1).ids).toEqual([]);
	});
});

describe('pruneSelection', () => {
	it('drops ids that are no longer displayed', () => {
		const multi = toggleIndex(selectSingle('a'), 'c');
		const pruned = pruneSelection(multi, ['a', 'b']);
		expect(pruned.ids).toEqual(['a']);
		expect(pruned.lastId).toBeNull();
		expect(isSelected(pruned, 'c')).toBe(false);
	});

	it('returns the same state when nothing changed', () => {
		const state = selectSingle('a');
		expect(pruneSelection(state, order)).toBe(state);
	});
});

describe('seedSelection', () => {
	it('presets every id in multiple mode', () => {
		const state = seedSelection(['b', 'd']);
		expect(state.ids).toEqual(['b', 'd']);
		expect(state.anchorId).toBe('b');
		expect(state.lastId).toBe('d');
	});

	it('keeps only the first id in single mode', () => {
		expect(seedSelection(['b', 'd'], 'single').ids).toEqual(['b']);
	});

	it('is empty for no ids', () => {
		expect(seedSelection([])).toEqual(emptySelection());
	});
});

describe('selectAll', () => {
	it('selects every row, anchored on the first and last on the final one', () => {
		expect(selectAll(order)).toEqual({ ids: order, anchorId: 'a', lastId: 'e' });
	});

	it('does not share the given array', () => {
		expect(selectAll(order).ids).not.toBe(order);
	});

	it('is empty for no rows', () => {
		expect(selectAll([])).toEqual(emptySelection());
	});
});

describe('selectionStateOf', () => {
	it('is none when no displayed row is selected', () => {
		expect(selectionStateOf(emptySelection(), order)).toBe('none');
		expect(selectionStateOf(selectSingle('z'), order)).toBe('none');
	});

	it('is some when part of the rows is selected', () => {
		expect(selectionStateOf(seedSelection(['a', 'c']), order)).toBe('some');
	});

	it('is all when every row is selected', () => {
		expect(selectionStateOf(selectAll(order), order)).toBe('all');
	});

	it('is none for an empty table', () => {
		expect(selectionStateOf(emptySelection(), [])).toBe('none');
	});
});
