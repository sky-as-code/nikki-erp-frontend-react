import { describe, expect, it } from 'vitest';

import {
	EMPTY_VALUE, currencySymbolPosition, formatLocalizedDateTime, formatLocalizedMoney,
	formatLocalizedNumber, inferDateTimeKind, parseRawNumber,
} from './localizedFormat';


/** Intl emits non-breaking spaces between symbol and amount; NFKC folds them to plain spaces. */
function plain(text: string): string {
	return text.normalize('NFKC');
}

describe('parseRawNumber', () => {
	it('parses numeric strings and numbers', () => {
		expect(parseRawNumber('1234.5')).toBe(1234.5);
		expect(parseRawNumber(' 7 ')).toBe(7);
		expect(parseRawNumber(42)).toBe(42);
		expect(parseRawNumber('1e3')).toBe(1000);
	});

	it('returns null for empty, unset or non-numeric input', () => {
		expect(parseRawNumber('')).toBeNull();
		expect(parseRawNumber(null)).toBeNull();
		expect(parseRawNumber(undefined)).toBeNull();
		expect(parseRawNumber('abc')).toBeNull();
		expect(parseRawNumber('Infinity')).toBeNull();
	});
});

describe('formatLocalizedNumber', () => {
	it('uses the locale grouping and decimal separators', () => {
		expect(formatLocalizedNumber('1234567.5', 'en-US')).toBe('1,234,567.5');
		expect(formatLocalizedNumber('1234567.5', 'vi-VN')).toBe('1.234.567,5');
	});

	it('keeps the fraction digits carried by the raw string', () => {
		expect(formatLocalizedNumber('12.50', 'en-US')).toBe('12.50');
		expect(formatLocalizedNumber('12', 'en-US')).toBe('12');
	});

	it('honours an explicit fraction digit count', () => {
		expect(formatLocalizedNumber('12.5', 'en-US', { fractionDigits: 2 })).toBe('12.50');
		expect(formatLocalizedNumber('12.567', 'en-US', { fractionDigits: 0 })).toBe('13');
	});

	it('renders the empty glyph for unset values', () => {
		expect(formatLocalizedNumber('', 'en-US')).toBe(EMPTY_VALUE);
		expect(formatLocalizedNumber(null, 'en-US')).toBe(EMPTY_VALUE);
		expect(formatLocalizedNumber('n/a', 'en-US')).toBe(EMPTY_VALUE);
	});
});

describe('formatLocalizedMoney', () => {
	it('prefixes the symbol in en-US', () => {
		expect(plain(formatLocalizedMoney('1234.5', 'en-US', '$', { fractionDigits: 2 }))).toBe('$1,234.50');
	});

	it('suffixes the symbol in vi-VN with a zero-scale currency', () => {
		expect(plain(formatLocalizedMoney('1234.5', 'vi-VN', '₫', { fractionDigits: 0 }))).toBe('1.235 ₫');
	});

	it('keeps the locale sign position for negative amounts', () => {
		expect(plain(formatLocalizedMoney('-1234', 'en-US', '$', { fractionDigits: 0 }))).toBe('-$1,234');
		expect(plain(formatLocalizedMoney('-1234', 'vi-VN', '₫', { fractionDigits: 0 }))).toBe('-1.234 ₫');
	});

	it('renders the empty glyph for unset values', () => {
		expect(formatLocalizedMoney(undefined, 'en-US', '$')).toBe(EMPTY_VALUE);
	});
});

describe('currencySymbolPosition', () => {
	it('reports prefix for en-US and suffix for vi-VN', () => {
		expect(currencySymbolPosition('en-US')).toBe('prefix');
		expect(currencySymbolPosition('vi-VN')).toBe('suffix');
	});
});

describe('inferDateTimeKind', () => {
	it('detects date, time and datetime shapes', () => {
		expect(inferDateTimeKind('2026-09-16')).toBe('date');
		expect(inferDateTimeKind('08:05')).toBe('time');
		expect(inferDateTimeKind('08:05:09')).toBe('time');
		expect(inferDateTimeKind('2026-09-16T08:05:00Z')).toBe('datetime');
	});
});

describe('formatLocalizedDateTime', () => {
	it('formats a date-only value without a timezone shift', () => {
		expect(formatLocalizedDateTime('2026-09-16', 'en-US')).toBe('09/16/2026');
		expect(formatLocalizedDateTime('2026-09-16', 'vi-VN')).toBe('16/09/2026');
		expect(formatLocalizedDateTime('2026-01-01', 'en-US', 'date')).toBe('01/01/2026');
	});

	it('formats a time-only value, with seconds only when present', () => {
		expect(plain(formatLocalizedDateTime('08:05', 'en-US'))).toBe('08:05 AM');
		expect(formatLocalizedDateTime('08:05', 'vi-VN')).toBe('08:05');
		expect(formatLocalizedDateTime('08:05:09', 'vi-VN')).toBe('08:05:09');
	});

	it('formats a datetime in the locale, including the date when the kind is datetime', () => {
		const formatted = formatLocalizedDateTime('2026-09-16T08:05:00', 'vi-VN', 'datetime');
		expect(formatted).toContain('16/09/2026');
		expect(formatted).toContain('08:05');
	});

	it('renders the empty glyph for unset or invalid values', () => {
		expect(formatLocalizedDateTime('', 'en-US')).toBe(EMPTY_VALUE);
		expect(formatLocalizedDateTime(null, 'en-US')).toBe(EMPTY_VALUE);
		expect(formatLocalizedDateTime('not-a-date', 'en-US')).toBe(EMPTY_VALUE);
		expect(formatLocalizedDateTime('2026-13-45', 'en-US', 'date')).not.toBe('13/45/2026');
	});
});

// Separator overrides exist for a tenant whose language record disagrees with Intl's conventions
// for their locale. Both languages shipped today agree with Intl, so this is the only coverage the
// path gets — a visible diff in the app would not reveal a regression here.
describe('language-record separator overrides', () => {
	it('swaps the grouping and decimal glyphs without moving the groups', () => {
		const formatted = formatLocalizedNumber('1234567.89', 'en-US', {
			decimalSeparator: ',',
			thousandsSeparator: '.',
		});

		expect(plain(formatted)).toBe('1.234.567,89');
	});

	it('leaves the locale separators alone when the record supplies none', () => {
		expect(plain(formatLocalizedNumber('1234567.89', 'en-US'))).toBe('1,234,567.89');
	});

	it('applies the overrides to money too, keeping the symbol where the locale puts it', () => {
		const formatted = formatLocalizedMoney('1234.5', 'en-US', '₫', {
			fractionDigits: 2,
			decimalSeparator: ',',
			thousandsSeparator: '.',
		});

		expect(plain(formatted)).toBe('₫1.234,50');
	});
});
