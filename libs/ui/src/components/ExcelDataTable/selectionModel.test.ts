import { describe, expect, it } from 'vitest';

import {
	emptySelection, isSelected, moveSelection, pruneSelection, selectSingle, selectWithModifiers,
} from './selectionModel';


const order = ['a', 'b', 'c', 'd', 'e'];

describe('selectWithModifiers', () => {
	it('plain click selects only the clicked row', () => {
		const state = selectWithModifiers(selectSingle('a'), order, 'c', {});
		expect(state.ids).toEqual(['c']);
		expect(state.anchorId).toBe('c');
		expect(state.lastId).toBe('c');
	});

	it('ctrl click toggles the row and keeps the rest', () => {
		const added = selectWithModifiers(selectSingle('a'), order, 'c', { ctrl: true });
		expect(added.ids).toEqual(['a', 'c']);
		const removed = selectWithModifiers(added, order, 'a', { ctrl: true });
		expect(removed.ids).toEqual(['c']);
		expect(removed.lastId).toBe('a');
	});

	it('shift click selects the range from the anchor, replacing the rest', () => {
		const state = selectWithModifiers(selectSingle('d'), order, 'b', { shift: true });
		expect(state.ids).toEqual(['b', 'c', 'd']);
		expect(state.anchorId).toBe('d');
		expect(state.lastId).toBe('b');
	});

	it('ctrl+shift click adds the range to the existing selection', () => {
		const base = selectWithModifiers(selectSingle('a'), order, 'e', { ctrl: true });
		const state = selectWithModifiers(base, order, 'c', { ctrl: true, shift: true });
		expect(state.ids).toEqual(['a', 'e', 'c', 'd']);
	});

	it('shift click with no anchor selects the clicked row', () => {
		const state = selectWithModifiers(emptySelection(), order, 'c', { shift: true });
		expect(state.ids).toEqual(['c']);
	});
});

describe('moveSelection', () => {
	it('moves a single selection and clamps at both ends', () => {
		expect(moveSelection(selectSingle('a'), order, -1).ids).toEqual(['a']);
		expect(moveSelection(selectSingle('a'), order, 1).ids).toEqual(['b']);
		expect(moveSelection(selectSingle('e'), order, 1).ids).toEqual(['e']);
	});

	it('collapses a multi-selection to the last touched row before moving', () => {
		const multi = selectWithModifiers(selectSingle('a'), order, 'd', { ctrl: true });
		expect(moveSelection(multi, order, 1).ids).toEqual(['e']);
	});

	it('selects the first row when nothing is selected', () => {
		expect(moveSelection(emptySelection(), order, 1).ids).toEqual(['a']);
		expect(moveSelection(emptySelection(), [], 1).ids).toEqual([]);
	});
});

describe('pruneSelection', () => {
	it('drops ids that are no longer displayed', () => {
		const multi = selectWithModifiers(selectSingle('a'), order, 'c', { ctrl: true });
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
