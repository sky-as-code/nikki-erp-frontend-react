import { describe, expect, it } from 'vitest';

import { countPages, parseUserFacingPageInput } from './Pagination';


describe('countPages', () => {
	it('divides and rounds up', () => {
		expect(countPages(100, 50)).toBe(2);
		expect(countPages(101, 50)).toBe(3);
	});

	it('reads one page for an empty table, not zero', () => {
		expect(countPages(0, 50)).toBe(1);
	});

	// The first render happens before any response arrives, and the count reaches `<Text>` as its
	// children — where NaN is a React warning, not a silent 0.
	it('survives the shape the table has before its first response', () => {
		expect(countPages(undefined, undefined)).toBe(1);
		expect(countPages(0, 0)).toBe(1);
		expect(countPages(100, 0)).toBe(1);
		expect(countPages(undefined, 50)).toBe(1);
		expect(countPages(100, undefined)).toBe(1);
	});
});

describe('parseUserFacingPageInput', () => {
	it('turns the 1-based number the user typed into a 0-based page', () => {
		expect(parseUserFacingPageInput('1', 10)).toBe(0);
		expect(parseUserFacingPageInput('10', 10)).toBe(9);
	});

	it('refuses a page outside the range', () => {
		expect(parseUserFacingPageInput('0', 10)).toBeNull();
		expect(parseUserFacingPageInput('11', 10)).toBeNull();
	});

	it('refuses anything that is not a whole number', () => {
		expect(parseUserFacingPageInput('', 10)).toBeNull();
		expect(parseUserFacingPageInput('abc', 10)).toBeNull();
		expect(parseUserFacingPageInput('1.5', 10)).toBeNull();
	});
});
