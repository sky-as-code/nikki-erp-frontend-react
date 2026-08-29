import { describe, expect, it } from 'vitest';

import { buildBrandPages } from './brand';
import { buildInventoryLocationPages } from './inventoryLocation';
import { buildProductAttributePages } from './productAttribute';
import { buildProductAttributeValuePages } from './productAttributeValue';
import { buildProductCategoryPages } from './productCategory';
import { buildProductTemplatePages } from './productTemplate';
import { buildProductTemplateAttributeValuePages } from './productTemplateAttributeValue';
import { buildProductTypePages } from './productType';
import { buildProductVariantPages } from './productVariant';
import { buildPutawayRulePages } from './putawayRule';
import { buildStockQuantPages } from './stockQuant';
import { buildStockScrapPages } from './stockScrap';
import { buildStockTransferPages } from './stockTransfer';
import { buildStorageCategoryPages } from './storageCategory';
import { buildSupplyRelationPages } from './supplyRelation';
import { buildWarehousePages } from './warehouse';
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
	{ name: 'productTemplateAttributeValue', build: buildProductTemplateAttributeValuePages },
	{ name: 'inventoryLocation', build: buildInventoryLocationPages },
	{ name: 'warehouse', build: buildWarehousePages },
	{ name: 'storageCategory', build: buildStorageCategoryPages },
	{ name: 'supplyRelation', build: buildSupplyRelationPages },
	{ name: 'putawayRule', build: buildPutawayRulePages },
	{ name: 'stockQuant', build: buildStockQuantPages },
	{ name: 'stockTransfer', build: buildStockTransferPages },
	{ name: 'stockScrap', build: buildStockScrapPages },
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

	/**
	 * URL paths separate words with `_`. The menu links in `menu.ts` are written by hand and
	 * nothing checks that one resolves to a declared route, so the exact list is pinned here:
	 * a rename that misses the menu shows up as a dead link only at runtime.
	 */
	it('registers one route per resource, all snake_case', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual([
			'product_templates', 'product_variants', 'product_types', 'product_categories',
			'brands', 'attributes', 'attribute_values', 'template_attribute_values',
			'locations', 'warehouses', 'storage_categories', 'supply_relations', 'putaway_rules',
			'stock_balance', 'stock_balance_counts_due', 'stock_transfers',
			'stock_scraps',
		]);
		for (const routePath of routePaths) {
			expect(routePath).toMatch(/^[a-z][a-z0-9_]*$/);
		}
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

		// Attributes, variants, prices, and the stock breakdown. Asserted by schema rather than by
		// count alone, so that adding a section is a deliberate change here rather than a number
		// quietly going up.
		//
		// The breakdown lists variants, not quants: a template holds no stock of its own, and a
		// quant cannot be reached from a template in one search anyway — `linked` traverses only a
		// many edge, and quant → variant is many:one. See CR §5.3 and §24.
		expect(tables.map(table => table.props?.schemaName)).toEqual([
			c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME,
			c.PRODUCT_VARIANT_SCHEMA_NAME,
			// Purchase's resource on Inventory's page. A literal rather than a constant, because
			// the module may not import from purchase/ and this test must fail if the string here
			// ever drifts from the one the page sends.
			'purchase_vendor_product_price',
			c.PRODUCT_VARIANT_SCHEMA_NAME,
			// The inventory unit, configured here but owned by Stock: it decides what a balance
			// means, so it is its own resource rather than a column on the template (CR §11.4).
			c.STOCK_PRODUCT_CONFIG_SCHEMA_NAME,
		]);
		for (const table of tables) {
			expect(table.props?.filterGraph).toEqual({ if: ['product_template_id', '=', '${id}'] });
		}
	});

	it('points the variants table at the variant page, not the current one', () => {
		const [page] = buildProductTemplatePages();
		const variantTable = collectComponents(page, 'resourceTable')
			.find(node => node.props?.schemaName === c.PRODUCT_VARIANT_SCHEMA_NAME);

		expect(variantTable?.props?.linkRoutePath).toBe('product_variants');
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

describe('Product stock integration', () => {
	/**
	 * Product is an entry point onto stock, not an owner of it. Each section reads a resource
	 * another part of the module owns and links to the page that owns it (CR §4.4, §6.1).
	 */
	it('shows a variant its stock, its movements and its putaway rules', () => {
		const [page] = buildProductVariantPages();
		const tables = collectComponents(page, 'resourceTable');

		expect(tables.map(table => table.props?.schemaName)).toEqual([
			c.STOCK_QUANT_SCHEMA_NAME,
			c.STOCK_MOVE_SCHEMA_NAME,
			c.PUTAWAY_RULE_SCHEMA_NAME,
		]);

		// Stock names the variant `product_variant_id`; a putaway rule calls the same reference
		// `product_id`, because Warehouse's rule may point at a product or a category. Each filter
		// has to use the field its own schema declares — a shared spelling would match nothing.
		expect(tables[0].props?.filterGraph).toEqual({ if: ['product_variant_id', '=', '${id}'] });
		expect(tables[1].props?.filterGraph).toEqual({ if: ['product_variant_id', '=', '${id}'] });
		expect(tables[2].props?.filterGraph).toEqual({ if: ['product_id', '=', '${id}'] });
	});

	/**
	 * Quantities are read-only on a product page. No section names an update command, so there is
	 * no edit affordance to suppress and no path from Product to setting a balance (CR §6.2,
	 * AC-PROD-INT-034).
	 */
	it('binds no write command on any variant stock section', () => {
		const [page] = buildProductVariantPages();

		for (const table of collectComponents(page, 'resourceTable')) {
			expect(table.props?.updateSaveCommand).toBeUndefined();
			expect(table.props?.deleteCommand).toBeUndefined();
			expect(table.props?.archiveCommand).toBeUndefined();
		}
	});

	/**
	 * The two tables listing the same schema on one page need distinct testId prefixes, or their
	 * rendered `data-testid`s collide and a test cannot tell one from the other.
	 */
	it('gives the template its own testId for the second variants table', () => {
		const [page] = buildProductTemplatePages();
		const variantTables = collectComponents(page, 'resourceTable')
			.filter(table => table.props?.schemaName === c.PRODUCT_VARIANT_SCHEMA_NAME);

		expect(variantTables).toHaveLength(2);
		expect(variantTables[1].props?.testId).toBe('inventory.templateInventory');
	});

	/** Category-level putaway rules, shown where the category is (CR §10.2, TS-PROD-14). */
	it('shows a category the putaway rules that match it', () => {
		const [page] = buildProductCategoryPages();
		const putaway = collectComponents(page, 'resourceTable')
			.find(table => table.props?.schemaName === c.PUTAWAY_RULE_SCHEMA_NAME);

		expect(putaway?.props?.filterGraph).toEqual({ if: ['product_category_id', '=', '${id}'] });
		expect(putaway?.props?.linkRoutePath).toBe('putaway_rules');
	});
});

describe('Stock balance page', () => {
	/**
	 * The backend engine refuses create, update and delete on a stock quant: a balance is the
	 * running total of completed movements, not something a client sets (AC-STOCK-002). Binding a
	 * write action here would render a button whose only outcome is a business violation, so the
	 * absence is pinned rather than left to be reintroduced by a copy-paste from another page.
	 */
	it('offers no write action', () => {
		const [page] = buildStockQuantPages();
		const props = page.props as {
			primary: { props: Record<string, unknown> },
			secondary: { props: { standardActionCommands?: Record<string, unknown> } },
		};

		expect(props.primary.props.createEnabled).toBe(false);
		expect(props.primary.props.deleteCommand).toBeUndefined();
		expect(props.primary.props.archiveCommand).toBeUndefined();
		expect(props.primary.props.updateSaveCommand).toBeUndefined();
		expect(Object.keys(props.secondary.props.standardActionCommands ?? {})).toEqual(['getById']);
	});

	it('binds the page to the backend stock quant schema', () => {
		const [page] = buildStockQuantPages();
		const props = page.props as { primary: { props: { schemaName: string } } };

		expect(props.primary.props.schemaName).toBe('inventory_stock_quant');
		expect(props.primary.props.schemaName).toBe(c.STOCK_QUANT_SCHEMA_NAME);
	});

	/**
	 * The "Đến hạn kiểm kê" menu item is a second entry point into this same list, distinguished
	 * only by this filter — without it the route would render the identical unfiltered balance.
	 */
	it('filters the counts-due route to balances with a due count', () => {
		const [, countsDuePage] = buildStockQuantPages();
		const props = countsDuePage.props as { primary: { props: { filterGraph?: unknown } } };

		expect(countsDuePage.routePath).toBe('stock_balance_counts_due');
		expect(props.primary.props.filterGraph).toEqual({ if: ['next_count_date', '<=', '${today}'] });
	});
});

describe('Stock transfer page', () => {
	/**
	 * The movement operations are what the page exists for. Losing one leaves a transfer that can
	 * be created and edited but never acted on, which nothing else would report.
	 */
	it('offers every movement operation', () => {
		const [page] = buildStockTransferPages();
		const props = page.props as {
			secondary: { props: { contextualActions?: Record<string, unknown> } },
		};

		expect(Object.keys(props.secondary.props.contextualActions ?? {}).sort()).toEqual([
			'cancel', 'check_availability', 'confirm', 'create_return', 'reserve', 'unreserve',
			'validate',
		]);
	});

	/**
	 * AC-STOCK-009: a completed transfer is corrected by a reverse transfer, never by cancelling.
	 * Offering Cancel on a done transfer invites a click whose only outcome is a refusal.
	 */
	it('hides cancel and validate once a transfer is done', () => {
		const [page] = buildStockTransferPages();
		const props = page.props as {
			secondary: {
				props: {
					contextualActions: Record<string, { condition?: { operator: string, value: unknown } }>,
				},
			},
		};
		const actions = props.secondary.props.contextualActions;

		expect(actions.cancel.condition).toEqual({
			field: 'status', operator: 'not_in', value: ['done', 'cancelled'],
		});
		expect(actions.validate.condition?.value).not.toContain('done');
	});

	/**
	 * The related tables filter by the current transfer. A literal `${id}` reaching the backend
	 * would match nothing, and the wrong operator would be rejected outright.
	 */
	it('filters the moves and lines by the transfer id', () => {
		const [page] = buildStockTransferPages();
		const tables = collectComponents(page, 'resourceTable');

		expect(tables.map(table => table.props?.schemaName)).toEqual([
			c.STOCK_MOVE_SCHEMA_NAME,
			c.STOCK_MOVE_LINE_SCHEMA_NAME,
		]);
		for (const table of tables) {
			expect(table.props?.filterGraph).toEqual({ if: ['transfer_id', '=', '${id}'] });
		}
	});

	it('binds the page to the backend stock transfer schema', () => {
		const [page] = buildStockTransferPages();
		const props = page.props as { primary: { props: { schemaName: string } } };

		expect(props.primary.props.schemaName).toBe('inventory_stock_transfer');
		expect(props.primary.props.schemaName).toBe(c.STOCK_TRANSFER_SCHEMA_NAME);
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

describe('Template attribute value page', () => {
	/**
	 * A schema name that disagrees with the backend Go constant does not error — it leaves the page
	 * on its loading spinner forever, because the registry simply never resolves it. Pinned as a
	 * literal so the assertion is against the real string rather than the constant against itself.
	 */
	it('binds both panes to the backend junction schema', () => {
		const [page] = buildProductTemplateAttributeValuePages();
		const props = page.props as {
			primary: { props: { schemaName: string } },
			secondary: { props: { schemaName: string } },
		};

		expect(props.primary.props.schemaName)
			.toBe('inventory_product_template_attribute_value');
		expect(props.secondary.props.schemaName)
			.toBe(c.PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME);
	});

	/**
	 * The whole reason this page exists. `sales_price_extra` moved onto this junction, and a
	 * surcharge nobody can edit is a surcharge nobody can set — so if it ever drops off the form,
	 * the field is dead and nothing else would say so.
	 */
	it('puts sales_price_extra on the form', () => {
		const [page] = buildProductTemplateAttributeValuePages();
		const fields = collectComponents(page, 'resourceForm.column')
			.flatMap(node => (node.props?.fields as string[] | undefined) ?? []);

		expect(fields).toContain('sales_price_extra');
	});

	/**
	 * Reached from the attributes table on the template page, because the junction row carries
	 * `template_attribute_id` and not the template id — its values are two hops from a template.
	 * A missing link here leaves the page unreachable except by typing the URL.
	 */
	it('is linked from the template attributes table', () => {
		const [template] = buildProductTemplatePages();
		const attributes = collectComponents(template, 'resourceTable')
			.find(node => node.props?.schemaName === c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME);

		expect(attributes?.props?.linkRoutePath).toBe('template_attribute_values');
	});
});
