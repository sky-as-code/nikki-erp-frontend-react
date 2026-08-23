import { describe, expect, it } from 'vitest';

import { fillRouteParams, isAbsoluteRoutePath } from './useResourceLinkHref';


/**
 * `ViewEngineRouter` registers every page as its own flat route, so a link that hops with `'..'`
 * lands on the module root rather than one segment up. Naming the target page and filling its
 * params is what makes a cross-page link exact; these pin that substitution.
 */
describe('fillRouteParams', () => {
	it('substitutes a param from the current route', () => {
		expect(fillRouteParams('kiosks/:id/stock-grid', { id: 'k1' })).toBe('kiosks/k1/stock-grid');
	});

	it('leaves a path with no params untouched', () => {
		expect(fillRouteParams('kiosks/new', { id: 'k1' })).toBe('kiosks/new');
	});

	it('substitutes every param, not just the first', () => {
		expect(fillRouteParams(':a/x/:b', { a: '1', b: '2' })).toBe('1/x/2');
	});

	/** Half a path is worse than no link: it would navigate to a literal `:id` segment. */
	it('gives up when a param is missing', () => {
		expect(fillRouteParams('kiosks/:id/stock-grid', {})).toBeUndefined();
	});

	it('gives up on an absent path', () => {
		expect(fillRouteParams(undefined, { id: 'k1' })).toBeUndefined();
	});
});

describe('isAbsoluteRoutePath', () => {
	it('treats a page routePath as absolute', () => {
		expect(isAbsoluteRoutePath('kiosks/:id')).toBe(true);
	});

	/** The `'../'` back link every resource detail authors keeps React Router's own resolution. */
	it('leaves a relative link to the router', () => {
		expect(isAbsoluteRoutePath('../')).toBe(false);
		expect(isAbsoluteRoutePath('./sibling')).toBe(false);
	});

	it('treats an absent path as not absolute', () => {
		expect(isAbsoluteRoutePath(undefined)).toBe(false);
	});
});
