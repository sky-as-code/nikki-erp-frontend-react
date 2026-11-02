import { describe, expect, it } from 'vitest';

import { stripTranslationTags } from './translationTags';


describe('stripTranslationTags', () => {
	it('turns a line break into a space', () => {
		expect(stripTranslationTags('New<br/>stock transfer')).toBe('New stock transfer');
		expect(stripTranslationTags('Tạo phiếu<br />chuyển kho')).toBe('Tạo phiếu chuyển kho');
		expect(stripTranslationTags('A <BR> b')).toBe('A b');
	});

	it('drops other basic tags and keeps their text', () => {
		expect(stripTranslationTags('<strong>Bold</strong> and <i>italic</i>')).toBe('Bold and italic');
	});

	it('leaves text without tags as is', () => {
		expect(stripTranslationTags('a < b, c > d')).toBe('a < b, c > d');
		expect(stripTranslationTags('  spaced  ')).toBe('  spaced  ');
	});
});
