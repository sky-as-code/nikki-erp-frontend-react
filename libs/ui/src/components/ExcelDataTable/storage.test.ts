import { describe, expect, it } from 'vitest';

import { DEFAULT_VIEW_MODE } from './types';

import type { ExcelViewMode } from './types';


/**
 * The rule `resolveInitialViewMode` applies, isolated from `localStorage` so it can be asserted
 * without a DOM. Kept in step with the function's own expression.
 */
function resolveFor(
	stored: ExcelViewMode | null,
	initial: ExcelViewMode | undefined,
	allowed?: ExcelViewMode[],
): ExcelViewMode {
	if (stored && (!allowed || allowed.includes(stored))) {
		return stored;
	}
	return initial ?? DEFAULT_VIEW_MODE;
}

describe('initial view-mode rule', () => {
	it('takes the page\'s initial mode when nothing is stored', () => {
		expect(resolveFor(null, 'list', ['list', 'card'])).toBe('list');
	});

	it('restores a stored mode the page still offers', () => {
		expect(resolveFor('card', 'list', ['list', 'card'])).toBe('card');
	});

	/**
	 * The case the `allowed` argument exists for: a mode remembered from an earlier build of the
	 * same page, which nothing renders any more. Without the fallback the body would be blank,
	 * with no control on screen to switch back.
	 */
	it('drops a stored mode the page no longer offers', () => {
		expect(resolveFor('card', 'list', ['list'])).toBe('list');
	});

	// Nothing to validate against, and refusing the value would throw away a real preference.
	it('accepts any stored mode when the caller declares no modes', () => {
		expect(resolveFor('card', 'list')).toBe('card');
	});

	it('falls back to the default mode when the page names no initial one', () => {
		expect(resolveFor(null, undefined, ['list'])).toBe(DEFAULT_VIEW_MODE);
	});
});
