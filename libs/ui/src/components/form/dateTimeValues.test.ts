import { describe, expect, it } from 'vitest';

import { inputTimeToModel, pickerDateTimeToIso, storedDateToPicker, storedTimeToInput } from './dateTimeValues';


describe('pickerDateTimeToIso', () => {
	it('reads the picker string as local time and emits RFC3339 UTC ending in Z', () => {
		const expected = new Date(2026, 9, 30, 14, 5, 9).toISOString().replace('.000Z', 'Z');
		expect(pickerDateTimeToIso('2026-10-30 14:05:09')).toBe(expected);
		expect(pickerDateTimeToIso('2026-10-30 14:05')).toBe(
			new Date(2026, 9, 30, 14, 5, 0).toISOString().replace('.000Z', 'Z'),
		);
		expect(pickerDateTimeToIso('2026-10-30 14:05:09')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
	});

	it('round-trips through the displayed Date', () => {
		const iso = pickerDateTimeToIso('2026-01-02 23:30:00')!;
		const shown = new Date(iso);
		expect([shown.getFullYear(), shown.getMonth(), shown.getDate(), shown.getHours(), shown.getMinutes()])
			.toEqual([2026, 0, 2, 23, 30]);
	});

	it('accepts a Date, passes an ISO string through and blanks empty input', () => {
		expect(pickerDateTimeToIso(new Date(Date.UTC(2026, 0, 1, 8)))).toBe('2026-01-01T08:00:00Z');
		expect(pickerDateTimeToIso('2026-01-01T08:00:00Z')).toBe('2026-01-01T08:00:00Z');
		expect(pickerDateTimeToIso(null)).toBeUndefined();
		expect(pickerDateTimeToIso('')).toBeUndefined();
	});
});

describe('date and time values', () => {
	it('keeps a stored date as its string', () => {
		expect(storedDateToPicker('2026-03-04')).toBe('2026-03-04');
		expect(storedDateToPicker(undefined)).toBeNull();
	});

	it('emits nikkiTime as HH:mm:ss', () => {
		expect(inputTimeToModel('09:15')).toBe('09:15:00');
		expect(inputTimeToModel('09:15:30')).toBe('09:15:30');
		expect(inputTimeToModel('')).toBeUndefined();
	});

	it('shows a stored time without seconds unless asked', () => {
		expect(storedTimeToInput('09:15:30', false)).toBe('09:15');
		expect(storedTimeToInput('09:15:30', true)).toBe('09:15:30');
		expect(storedTimeToInput(undefined, false)).toBe('');
	});
});
