import { describe, expect, it } from 'vitest';

import { propagateCurrentLangToEmpty } from './langJson';


const LANGUAGES = ['en-US', 'vi-VN'];

/** Types `text` one keystroke at a time into the en-US input, the way `LangJsonField` does. */
function typeInto(start: Record<string, string>, text: string): Record<string, string> {
	let value = start;
	for (let i = 1; i <= text.length; i++) {
		const previous = value['en-US'] ?? '';
		value = propagateCurrentLangToEmpty({ ...value, 'en-US': text.slice(0, i) }, 'en-US', LANGUAGES, previous);
	}
	return value;
}

describe('propagateCurrentLangToEmpty', () => {
	// The first keystroke used to seed vi-VN with one letter, which then stopped following.
	it('mirrors the whole typed text into an untranslated language', () => {
		expect(typeInto({}, 'Navy')).toEqual({ 'en-US': 'Navy', 'vi-VN': 'Navy' });
	});

	it('keeps following after the text was replaced from scratch', () => {
		expect(typeInto({ 'en-US': 'Blue' }, 'Navy')).toEqual({ 'en-US': 'Navy', 'vi-VN': 'Navy' });
	});

	it('never overwrites a language translated differently', () => {
		expect(typeInto({ 'en-US': 'Blue', 'vi-VN': 'Xanh' }, 'Navy')).toEqual({ 'en-US': 'Navy', 'vi-VN': 'Xanh' });
	});

	it('fills only empty languages when no previous value is known', () => {
		expect(propagateCurrentLangToEmpty({ 'en-US': 'A', 'vi-VN': 'B' }, 'en-US', LANGUAGES)).toEqual({ 'en-US': 'A', 'vi-VN': 'B' });
	});
});
