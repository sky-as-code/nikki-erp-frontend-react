import { describe, expect, it } from 'vitest';

import { COMPACT_WIDTH_PX } from './useIsCompact';


/**
 * The rule `useIsCompact` applies, isolated from the React hook so it can be asserted directly.
 * Kept in step with the hook's own expression.
 */
function isCompactFor(containerWidth: number | null, isNarrowViewport: boolean): boolean {
	return containerWidth === null ? isNarrowViewport : containerWidth < COMPACT_WIDTH_PX;
}

describe('compact-mode rule', () => {
	// The case the container measurement exists for: a list pane narrowed by the split-view
	// splitter is narrower than a phone while the window stays wide.
	it('goes compact for a narrow container on a wide screen', () => {
		expect(isCompactFor(320, false)).toBe(true);
	});

	it('stays full-width for a wide container', () => {
		expect(isCompactFor(1200, false)).toBe(false);
		expect(isCompactFor(COMPACT_WIDTH_PX, false)).toBe(false);
	});

	// Before the first ResizeObserver callback there is nothing to measure, so the viewport still
	// answers — otherwise the first paint on a phone would be the full-width layout.
	it('falls back to the viewport until the container has been measured', () => {
		expect(isCompactFor(null, true)).toBe(true);
		expect(isCompactFor(null, false)).toBe(false);
	});
});
