import { describe, expect, it } from 'vitest';

import { resolveInitialLanguage } from './index';


describe('resolveInitialLanguage', () => {
	it('keeps the stored language, the sign-in switcher choice included', () => {
		expect(resolveInitialLanguage('en-US', ['en-US', 'vi-VN'])).toBe('en-US');
	});

	it('defaults to vi-VN when nothing is stored', () => {
		expect(resolveInitialLanguage(null, ['en-US', 'vi-VN'])).toBe('vi-VN');
		expect(resolveInitialLanguage(undefined, ['en-US', 'vi-VN'])).toBe('vi-VN');
		expect(resolveInitialLanguage('', ['en-US', 'vi-VN'])).toBe('vi-VN');
	});

	it('falls to the first supported language when vi-VN is not supported', () => {
		expect(resolveInitialLanguage(null, ['en-US', 'ja-JP'])).toBe('en-US');
	});

	it('uses vi-VN for an empty supported list', () => {
		expect(resolveInitialLanguage(null, [])).toBe('vi-VN');
	});
});
