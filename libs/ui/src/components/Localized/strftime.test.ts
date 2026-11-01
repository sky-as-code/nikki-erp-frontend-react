import { describe, expect, it } from 'vitest';

import {
	STRFTIME_DISALLOWED_DIRECTIVES, STRFTIME_SUPPORTED_DIRECTIVES, dayjsLocaleOf, formatStrftime, strftimeToDayjs,
	weekDayIndexOf,
} from './strftime';


describe('strftimeToDayjs', () => {
	it('converts the patterns the language seeds ship', () => {
		expect(strftimeToDayjs('%m/%d/%Y')).toBe('MM/DD/YYYY');
		expect(strftimeToDayjs('%d/%m/%Y')).toBe('DD/MM/YYYY');
		expect(strftimeToDayjs('%H:%M:%S')).toBe('HH:mm:ss');
		expect(strftimeToDayjs('%H:%M')).toBe('HH:mm');
	});

	it('converts names, 12-hour clock, short year and offset', () => {
		expect(strftimeToDayjs('%A, %B %d %Y')).toBe('dddd, MMMM DD YYYY');
		expect(strftimeToDayjs('%a %b %y')).toBe('ddd MMM YY');
		expect(strftimeToDayjs('%I:%M %p')).toBe('hh:mm A');
		expect(strftimeToDayjs('%z')).toBe('ZZ');
		expect(strftimeToDayjs('%x %X')).toBe('L LTS');
	});

	it('escapes literal letters and keeps a literal percent', () => {
		expect(strftimeToDayjs('%d de %B')).toBe('DD[ de ]MMMM');
		expect(strftimeToDayjs('%H:%M h')).toBe('HH:mm[ h]');
		expect(strftimeToDayjs('100%% %Y')).toBe('100% YYYY');
	});

	it('answers null for every disallowed directive', () => {
		for (const directive of STRFTIME_DISALLOWED_DIRECTIVES) {
			expect(strftimeToDayjs(`%Y ${directive}`)).toBeNull();
		}
	});

	it('answers null for directives dayjs cannot render, unknown ones and a dangling %', () => {
		expect(strftimeToDayjs('%j')).toBeNull();
		expect(strftimeToDayjs('%U')).toBeNull();
		expect(strftimeToDayjs('%W')).toBeNull();
		expect(strftimeToDayjs('%Z')).toBeNull();
		expect(strftimeToDayjs('%Q')).toBeNull();
		expect(strftimeToDayjs('%Y%')).toBeNull();
	});

	it('answers null for an empty pattern and a literal that cannot be escaped', () => {
		expect(strftimeToDayjs('')).toBeNull();
		expect(strftimeToDayjs(undefined)).toBeNull();
		expect(strftimeToDayjs('%d ] x')).toBeNull();
	});

	it('converts every supported directive', () => {
		for (const directive of STRFTIME_SUPPORTED_DIRECTIVES) {
			expect(strftimeToDayjs(directive)).not.toBeNull();
		}
	});
});

describe('formatStrftime', () => {
	const date = new Date(2026, 10, 1, 14, 5, 9);

	it('formats with the converted pattern', () => {
		expect(formatStrftime(date, '%d/%m/%Y', 'vi-VN')).toBe('01/11/2026');
		expect(formatStrftime(date, '%m/%d/%Y', 'en-US')).toBe('11/01/2026');
		expect(formatStrftime(date, '%H:%M:%S', 'en-US')).toBe('14:05:09');
		expect(formatStrftime(date, '%I:%M %p', 'en-US')).toBe('02:05 PM');
	});

	it('prints names in the locale', () => {
		expect(formatStrftime(date, '%B', 'en-US')).toBe('November');
		expect(formatStrftime(date, '%B', 'vi-VN')).not.toBe('November');
	});

	it('answers null for a pattern it cannot convert', () => {
		expect(formatStrftime(date, '%D', 'en-US')).toBeNull();
	});
});

describe('dayjsLocaleOf and weekDayIndexOf', () => {
	it('picks the closest loaded dayjs locale', () => {
		expect(dayjsLocaleOf('vi-VN')).toBe('vi');
		expect(dayjsLocaleOf('en-US')).toBe('en');
		expect(dayjsLocaleOf('xx-YY')).toBe('en');
	});

	it('maps week day names to a Sunday-based index', () => {
		expect(weekDayIndexOf('sunday')).toBe(0);
		expect(weekDayIndexOf('monday')).toBe(1);
		expect(weekDayIndexOf('saturday')).toBe(6);
		expect(weekDayIndexOf('someday')).toBeUndefined();
		expect(weekDayIndexOf(undefined)).toBeUndefined();
	});
});
