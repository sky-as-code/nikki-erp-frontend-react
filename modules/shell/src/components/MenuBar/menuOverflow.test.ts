import { describe, expect, it } from 'vitest';

import { fitMenuItems } from './menuOverflow';


describe('fitMenuItems', () => {
	const widths = [80, 60, 100, 70, 90, 70, 75];
	const gap = 10;
	const overflow = 40;
	const allWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);

	it('shows every item when they all fit, with no overflow slot reserved', () => {
		expect(fitMenuItems(widths, overflow, gap, allWidth)).toBe(widths.length);
	});

	it('reserves room for the overflow trigger once one item does not fit', () => {
		// One pixel short: the last item (75) goes and the trigger (10 + 40) takes its place.
		expect(fitMenuItems(widths, overflow, gap, allWidth - 1)).toBe(widths.length - 1);
		// A trigger wider than the last item pushes out one more.
		expect(fitMenuItems(widths, 120, gap, allWidth - 1)).toBe(widths.length - 2);
	});

	it('shows no item when not even the first fits beside the trigger', () => {
		expect(fitMenuItems(widths, overflow, gap, 100)).toBe(0);
	});

	it('keeps exactly the items that fit beside the trigger', () => {
		// 80 + 10 + 60 + 10 + 100 = 260 fits; adding the trigger slot (10 + 40) needs 310.
		expect(fitMenuItems(widths, overflow, gap, 310)).toBe(3);
		expect(fitMenuItems(widths, overflow, gap, 309)).toBe(2);
	});
});
