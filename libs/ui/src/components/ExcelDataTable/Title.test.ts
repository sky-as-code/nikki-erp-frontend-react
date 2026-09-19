import { describe, expect, it } from 'vitest';

import { titleText } from './Title';


describe('titleText', () => {
	// The v1 table rendered "Users (10)"; the v2 heading has to read the same.
	it('appends the total in parentheses', () => {
		expect(titleText('Users', 10, true)).toBe('Users (10)');
	});

	// The singular/plural form is the caller's, resolved through i18next `count` — this only has to
	// leave it alone.
	it('keeps whatever singular or plural form the caller resolved', () => {
		expect(titleText('User', 1, true)).toBe('User (1)');
		expect(titleText('Người dùng', 3, true)).toBe('Người dùng (3)');
	});

	// An empty table still states its count, rather than reading as though the number were unknown.
	it('shows zero for an empty table, and for a total not yet loaded', () => {
		expect(titleText('Users', 0, true)).toBe('Users (0)');
		expect(titleText('Users', undefined, true)).toBe('Users (0)');
	});

	it('omits the count entirely when the table opts out', () => {
		expect(titleText('Users', 10, false)).toBe('Users');
	});
});
