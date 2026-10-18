import { describe, expect, it } from 'vitest';

import { isInsideTableScope, TABLE_SCOPE_ATTRIBUTE } from './tableScope';


/** A stand-in element whose ancestors match the given selectors. */
function elementMatching(...selectors: string[]) {
	return { closest: (selector: string) => (selectors.includes(selector) ? {} : null) };
}

describe('isInsideTableScope', () => {
	const own = `[${TABLE_SCOPE_ATTRIBUTE}="s1"]`;

	it('is inside for the table\'s own elements', () => {
		expect(isInsideTableScope(elementMatching(own), 's1')).toBe(true);
	});

	it('is inside for a portalled dropdown or menu', () => {
		expect(isInsideTableScope(elementMatching('[data-portal]'), 's1')).toBe(true);
	});

	it('is outside for another table and for the rest of the page', () => {
		expect(isInsideTableScope(elementMatching(`[${TABLE_SCOPE_ATTRIBUTE}="s2"]`), 's1')).toBe(false);
		expect(isInsideTableScope(elementMatching(), 's1')).toBe(false);
	});

	it('treats a target that is not an element as inside', () => {
		expect(isInsideTableScope(null, 's1')).toBe(true);
		expect(isInsideTableScope({}, 's1')).toBe(true);
	});
});
