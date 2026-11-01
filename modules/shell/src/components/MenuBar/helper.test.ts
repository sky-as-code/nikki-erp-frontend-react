import { describe, expect, it } from 'vitest';

import { isPathActiveWithPrefix } from './helper';


describe('isPathActiveWithPrefix', () => {
	it('marks a module index link active on the module root only', () => {
		expect(isPathActiveWithPrefix('/', '/settings', '/settings')).toBe(true);
		expect(isPathActiveWithPrefix('/', '/settings/', '/settings')).toBe(true);
		expect(isPathActiveWithPrefix('/', '/settings/languages', '/settings')).toBe(false);
	});

	it('marks a page link active on the page and below it', () => {
		expect(isPathActiveWithPrefix('/languages', '/settings/languages', '/settings')).toBe(true);
		expect(isPathActiveWithPrefix('/languages', '/settings/languages/01H', '/settings')).toBe(true);
		expect(isPathActiveWithPrefix('/languages', '/settings/languages-x', '/settings')).toBe(false);
		expect(isPathActiveWithPrefix('/languages', '/settings', '/settings')).toBe(false);
	});
});
