import { describe, expect, it } from 'vitest';

import { fillFromNeighbours, resolveLangJson, sortLanguageCodes } from './langJson';


describe('resolveLangJson', () => {
	const translate = (key: string) => (key === 'known' ? 'Translated' : undefined);

	it('prefers the `$ref` translation, falling through when it has none', () => {
		expect(resolveLangJson({ $ref: 'known', 'en-US': 'Plain' }, 'en-US', translate)).toBe('Translated');
		expect(resolveLangJson({ $ref: 'unknown', 'vi-VN': 'Xanh' }, 'vi-VN', translate)).toBe('Xanh');
	});

	it('falls back from the active language to en-US, then to any text, then to empty', () => {
		expect(resolveLangJson({ 'en-US': 'Blue', 'vi-VN': 'Xanh' }, 'vi-VN')).toBe('Xanh');
		expect(resolveLangJson({ 'en-US': 'Blue', 'vi-VN': '' }, 'vi-VN')).toBe('Blue');
		expect(resolveLangJson({ 'ja-JP': '', 'vi-VN': 'Xanh' }, 'fr-FR')).toBe('Xanh');
		expect(resolveLangJson({ $ref: 'unknown' }, 'en-US', translate)).toBe('');
		expect(resolveLangJson(undefined, 'en-US')).toBe('');
		expect(resolveLangJson({}, undefined)).toBe('');
	});
});

describe('sortLanguageCodes', () => {
	it('orders by code without mutating the input', () => {
		const codes = ['vi-VN', 'en-US', 'de-DE'];
		expect(sortLanguageCodes(codes)).toEqual(['de-DE', 'en-US', 'vi-VN']);
		expect(codes[0]).toBe('vi-VN');
	});
});

describe('fillFromNeighbours', () => {
	const codes = ['vi-VN', 'de-DE', 'en-US', 'ja-JP'];

	it('copies the nearest filled language before, else after, in code order', () => {
		expect(fillFromNeighbours({ 'en-US': 'Blue' }, codes))
			.toEqual({ 'de-DE': 'Blue', 'en-US': 'Blue', 'ja-JP': 'Blue', 'vi-VN': 'Blue' });
		expect(fillFromNeighbours({ 'de-DE': 'Blau', 'ja-JP': 'Ao' }, codes))
			.toEqual({ 'de-DE': 'Blau', 'en-US': 'Blau', 'ja-JP': 'Ao', 'vi-VN': 'Ao' });
	});

	it('treats a blank text as empty', () => {
		expect(fillFromNeighbours({ 'de-DE': ' ', 'en-US': 'Blue' }, ['de-DE', 'en-US']))
			.toEqual({ 'de-DE': 'Blue', 'en-US': 'Blue' });
	});

	it('leaves a `$ref` value and an all-empty value alone', () => {
		const ref = { $ref: 'key' };
		expect(fillFromNeighbours(ref, codes)).toBe(ref);
		const empty = { 'en-US': '' };
		expect(fillFromNeighbours(empty, codes)).toBe(empty);
		expect(fillFromNeighbours({}, codes)).toEqual({});
	});
});
