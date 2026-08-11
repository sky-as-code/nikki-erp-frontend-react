import { describe, expect, it } from 'vitest';

import { buildBrandPages } from './brand';
import { buildProductAttributePages } from './productAttribute';
import { buildProductAttributeValuePages } from './productAttributeValue';
import { buildProductCategoryPages } from './productCategory';
import { buildProductPricePages } from './productPrice';
import { buildProductTemplatePages } from './productTemplate';
import { buildProductTypePages } from './productType';
import { buildProductVariantPages } from './productVariant';
import * as c from '../constants';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'productTemplate', build: buildProductTemplatePages },
	{ name: 'productVariant', build: buildProductVariantPages },
	{ name: 'productType', build: buildProductTypePages },
	{ name: 'productCategory', build: buildProductCategoryPages },
	{ name: 'brand', build: buildBrandPages },
	{ name: 'productAttribute', build: buildProductAttributePages },
	{ name: 'productAttributeValue', build: buildProductAttributeValuePages },
	{ name: 'productPrice', build: buildProductPricePages },
];

describe('Inventory page metadata', () => {
	/**
	 * Building a page runs each prop builder's zod `parse`, so an invalid prop set throws here
	 * rather than at render time. `tsc` cannot catch it: the builders take a permissive input
	 * type and validate at runtime.
	 */
	it.each(allPages)('$name pages build without a schema violation', ({ build }) => {
		expect(() => build()).not.toThrow();
	});

	/**
	 * Page metadata crosses a bundle boundary, so it must be plain JSON. A class, function or
	 * live object here would survive local tests and fail once the micro-app is loaded remotely.
	 */
	it.each(allPages)('$name pages survive a JSON round-trip unchanged', ({ build }) => {
		const pages = build();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it.each(allPages)('$name pages carry no functions or class instances', ({ build }) => {
		expect(findNonPlainValue(build(), '$')).toBeNull();
	});

	it('registers one route per resource, all kebab-case', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual([
			'products', 'product-variants', 'product-types', 'product-categories',
			'brands', 'attributes', 'attribute-values', 'product-prices',
		]);
	});

	/**
	 * A schema name that does not match the backend Go constant fails silently: the page hangs on
	 * its loading spinner rather than reporting anything, so it is pinned here.
	 */
	it('binds the price page to the backend price schema', () => {
		const [page] = buildProductPricePages();
		const props = page.props as {
			primary: { props: { schemaName: string } },
			secondary: { props: { schemaName: string } },
		};

		expect(props.primary.props.schemaName).toBe('inventory_product_price');
		expect(props.secondary.props.schemaName).toBe(c.PRODUCT_PRICE_SCHEMA_NAME);
	});

	it('nests both split-view panes as template refs', () => {
		const [page] = buildProductTemplatePages();
		const props = page.props as { primary: { template: string }, secondary: { template: string } };

		expect(page.template).toContain('resourceSplitView');
		expect(props.primary.template).toContain('resourceList');
		expect(props.secondary.template).toContain('resourceDetails');
	});
});

describe('Product template detail sections', () => {
	/**
	 * The related-records tables filter by the current record's id. `${id}` is a placeholder the
	 * table resolves from the route param at render time — a literal `${id}` reaching the backend
	 * would match nothing, and the wrong operator would be rejected outright.
	 */
	it('filters the template detail tables by the template id', () => {
		const [page] = buildProductTemplatePages();
		const tables = collectComponents(page, 'resourceTable');

		// Attributes, variants and prices. Asserted by schema rather than by count alone, so that
		// adding a section is a deliberate change here rather than a number quietly going up.
		expect(tables.map(table => table.props?.schemaName)).toEqual([
			c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME,
			c.PRODUCT_VARIANT_SCHEMA_NAME,
			c.PRODUCT_PRICE_SCHEMA_NAME,
		]);
		for (const table of tables) {
			expect(table.props?.filterGraph).toEqual({ if: ['product_template_id', '=', '${id}'] });
		}
	});

	it('points the variants table at the variant page, not the current one', () => {
		const [page] = buildProductTemplatePages();
		const variantTable = collectComponents(page, 'resourceTable')
			.find(node => node.props?.schemaName === c.PRODUCT_VARIANT_SCHEMA_NAME);

		expect(variantTable?.props?.linkRoutePath).toBe('product-variants');
	});

	/**
	 * A badge renderer's `prefix` is what turns a stored enum value into an i18n key
	 * (`active` → `template_status.active`). Without it the raw value is displayed.
	 */
	it('keeps status renderers as serializable specs with their i18n prefix', () => {
		const [page] = buildProductTemplatePages();
		const props = page.props as { primary: { props: { fieldRenderers: Record<string, unknown> } } };

		expect(props.primary.props.fieldRenderers).toEqual({
			status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', active: 'green', discontinued: 'orange' },
				prefix: 'template_status.',
			},
		});
	});
});

/** Collects every component node of the given kind, at any depth of a page's props. */
function collectComponents(page: PageNode, componentIdPart: string): ComponentNode[] {
	const found: ComponentNode[] = [];
	walk(page);
	return found;

	function walk(value: unknown): void {
		if (Array.isArray(value)) {
			value.forEach(walk);
			return;
		}
		if (value === null || typeof value !== 'object') {
			return;
		}
		const node = value as ComponentNode;
		if (typeof node.component === 'string' && node.component.includes(componentIdPart)) {
			found.push(node);
		}
		Object.values(value).forEach(walk);
	}
}

/** Returns the path of the first non-JSON value found, or null when everything is plain. */
function findNonPlainValue(value: unknown, path: string): string | null {
	if (value === null || typeof value === 'string' || typeof value === 'number'
		|| typeof value === 'boolean') {
		return null;
	}
	if (typeof value === 'function') {
		return path;
	}
	if (Array.isArray(value)) {
		for (const [index, item] of value.entries()) {
			const found = findNonPlainValue(item, `${path}[${index}]`);
			if (found) {
				return found;
			}
		}
		return null;
	}
	if (typeof value === 'object') {
		// A class instance has a prototype other than Object.prototype; it would not survive
		// the trip through JSON that a bundle boundary imposes.
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) {
			return path;
		}
		for (const [key, item] of Object.entries(value)) {
			const found = findNonPlainValue(item, `${path}.${key}`);
			if (found) {
				return found;
			}
		}
		return null;
	}
	return path;
}
