import { describe, expect, it } from 'vitest';

import {
	resolvePreselection, selectionFlags, toggleAllOnPage, toggleRowInSelectionSet,
} from './SettingsTable';


const PAGE_ONE = ['a', 'b', 'c'];
const PAGE_TWO = ['d', 'e', 'f'];


describe('resolvePreselection', () => {
	it('keeps only the preselected values present on the page', () => {
		expect(resolvePreselection(PAGE_ONE, ['a', 'c', 'zz'])).toEqual(new Set(['a', 'c']));
	});

	it('returns an empty set when nothing is preselected', () => {
		expect(resolvePreselection(PAGE_ONE, undefined)).toEqual(new Set());
		expect(resolvePreselection(PAGE_ONE, [])).toEqual(new Set());
	});
});

describe('selectionFlags', () => {
	it('reports a fully selected page', () => {
		expect(selectionFlags(PAGE_ONE, new Set(PAGE_ONE)))
			.toEqual({ isAllSelected: true, isIndeterminate: false });
	});

	it('reports a partially selected page', () => {
		expect(selectionFlags(PAGE_ONE, new Set(['b'])))
			.toEqual({ isAllSelected: false, isIndeterminate: true });
	});

	it('ignores selected ids that live on another page', () => {
		// The controlled selection spans pages; the header must describe this page only.
		const selected = new Set([...PAGE_ONE, ...PAGE_TWO]);
		expect(selectionFlags(PAGE_ONE, selected))
			.toEqual({ isAllSelected: true, isIndeterminate: false });
		expect(selectionFlags(PAGE_ONE, new Set(PAGE_TWO)))
			.toEqual({ isAllSelected: false, isIndeterminate: false });
	});

	it('treats an empty page as neither all-selected nor indeterminate', () => {
		expect(selectionFlags([], new Set(PAGE_TWO)))
			.toEqual({ isAllSelected: false, isIndeterminate: false });
	});
});

describe('toggleAllOnPage', () => {
	it('unions the page into the selection, preserving off-page ids', () => {
		const selected = new Set(['d']);
		expect(toggleAllOnPage(selected, PAGE_ONE, false)).toEqual(new Set(['d', 'a', 'b', 'c']));
	});

	it('subtracts only the page, preserving off-page ids', () => {
		const selected = new Set([...PAGE_ONE, 'd']);
		expect(toggleAllOnPage(selected, PAGE_ONE, true)).toEqual(new Set(['d']));
	});

	it('does not mutate the input set', () => {
		const selected = new Set(['d']);
		toggleAllOnPage(selected, PAGE_ONE, false);
		expect(selected).toEqual(new Set(['d']));
	});
});

describe('toggleRowInSelectionSet', () => {
	it('adds then removes a value without touching the rest', () => {
		const added = toggleRowInSelectionSet(new Set(['d']), 'a');
		expect(added).toEqual(new Set(['d', 'a']));
		expect(toggleRowInSelectionSet(added, 'a')).toEqual(new Set(['d']));
	});
});

describe('controlled selection across a page change', () => {
	// The regression this suite exists for: paging must not shrink the selection. The
	// controlled table derives its set from the prop and never intersects it with the rows it
	// happens to be rendering.
	it('survives swapping the visible rows', () => {
		let selected = new Set<string>();
		selected = toggleRowInSelectionSet(selected, 'a');
		expect(selectionFlags(PAGE_ONE, selected).isIndeterminate).toBe(true);

		// Page forward: same set, different rows.
		expect(selectionFlags(PAGE_TWO, selected))
			.toEqual({ isAllSelected: false, isIndeterminate: false });
		selected = toggleRowInSelectionSet(selected, 'e');

		// Page back: the original pick is still there.
		expect(selected).toEqual(new Set(['a', 'e']));
		expect(selectionFlags(PAGE_ONE, selected).isIndeterminate).toBe(true);
	});
});
