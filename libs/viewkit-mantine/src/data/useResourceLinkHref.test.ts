import { describe, expect, it } from 'vitest';

import { buildResourceBaseHref, fillRouteParams, isAbsoluteRoutePath } from './useResourceLinkHref';


/**
 * The resource URL shape, which every helper in the module flows through. The organization used
 * to lead this path; it is now resolved from storage instead of the URL.
 */
describe('buildResourceBaseHref', () => {
	it('builds /{moduleSlug}/{routePath}, with no org segment', () => {
		expect(buildResourceBaseHref('essential', 'essential_uom')).toBe('/essential/essential_uom');
	});

	it('keeps a multi-segment route path', () => {
		expect(buildResourceBaseHref('vendingmachine', 'kiosks/k1/stock-grid'))
			.toBe('/vendingmachine/kiosks/k1/stock-grid');
	});

	it('gives up while the module or the route path is unknown', () => {
		expect(buildResourceBaseHref(undefined, 'essential_uom')).toBeUndefined();
		expect(buildResourceBaseHref('essential', undefined)).toBeUndefined();
	});

	/**
	 * A page embedding a table of a schema another module owns — the product template's vendor
	 * prices, owned by `purchase`. The bare form resolves against the current module, so it could
	 * only ever reach that module's own pages.
	 */
	it('takes a leading slash as naming the module, not the current one', () => {
		expect(buildResourceBaseHref('inventory', '/purchase/purchase_vendor_product_price'))
			.toBe('/purchase/purchase_vendor_product_price');
	});

	it('resolves an absolute path even before the current module is known', () => {
		expect(buildResourceBaseHref(undefined, '/purchase/purchase_vendor_product_price'))
			.toBe('/purchase/purchase_vendor_product_price');
	});
});


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
