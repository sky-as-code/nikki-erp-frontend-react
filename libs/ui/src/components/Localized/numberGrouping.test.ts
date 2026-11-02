import { describe, expect, it } from 'vitest';

import { groupDigits, inputGroupStyleOf, parseGrouping } from './numberGrouping';


describe('groupDigits', () => {
	it('[3] groups once and leaves the rest whole', () => {
		expect(groupDigits('1234567', [3], ',')).toBe('1234,567');
		expect(groupDigits('106500', [3], ',')).toBe('106,500');
	});

	it('[3,0] repeats groups of three', () => {
		expect(groupDigits('1234567', [3, 0], ',')).toBe('1,234,567');
		expect(groupDigits('123', [3, 0], ',')).toBe('123');
		expect(groupDigits('1234', [3, 0], '.')).toBe('1.234');
	});

	it('[3,2,-1] groups three then two, then stops', () => {
		expect(groupDigits('106500', [3, 2, -1], ',')).toBe('1,06,500');
		expect(groupDigits('12345678', [3, 2, -1], ',')).toBe('123,45,678');
	});

	it('[3,2,0] is the Indian lakh style', () => {
		expect(groupDigits('12345678', [3, 2, 0], ',')).toBe('1,23,45,678');
	});

	it('[] does not group', () => {
		expect(groupDigits('1234567', [], ',')).toBe('1234567');
	});

	it('handles short numbers and an empty separator', () => {
		expect(groupDigits('7', [3, 0], ',')).toBe('7');
		expect(groupDigits('1234567', [3, 0], '')).toBe('1234567');
	});
});

describe('parseGrouping', () => {
	it('parses an integer array', () => {
		expect(parseGrouping('[3,0]')).toEqual([3, 0]);
		expect(parseGrouping('[3,2,-1]')).toEqual([3, 2, -1]);
		expect(parseGrouping('[]')).toEqual([]);
	});

	it('refuses anything else', () => {
		expect(parseGrouping('')).toBeUndefined();
		expect(parseGrouping(undefined)).toBeUndefined();
		expect(parseGrouping('[3,')).toBeUndefined();
		expect(parseGrouping('[3.5]')).toBeUndefined();
		expect(parseGrouping('["3"]')).toBeUndefined();
		expect(parseGrouping('3')).toBeUndefined();
	});
});

describe('inputGroupStyleOf', () => {
	it('maps groupings to the closest input style', () => {
		expect(inputGroupStyleOf(undefined)).toBe('thousand');
		expect(inputGroupStyleOf([3, 0])).toBe('thousand');
		expect(inputGroupStyleOf([3, 2, 0])).toBe('lakh');
		expect(inputGroupStyleOf([4, 0])).toBe('wan');
		expect(inputGroupStyleOf([])).toBe('none');
		expect(inputGroupStyleOf([-1])).toBe('none');
	});
});
