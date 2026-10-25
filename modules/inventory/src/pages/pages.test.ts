import { findUngatedActions } from '@nikkierp/viewkit-mantine/actionCodes';
import { RESOURCE_DETAIL_V2_TEMPLATE, RESOURCE_LIST_V2_TEMPLATE } from '@nikkierp/viewkit-mantine/ids';
import { describe, expect, it } from 'vitest';

import { buildBrandPages } from './brand';
import { buildInventoryLocationPages } from './inventoryLocation';
import { buildProductAttributePages } from './productAttribute';
import { buildProductAttributeValuePages } from './productAttributeValue';
import { buildProductCategoryPages } from './productCategory';
import { buildProductTemplatePages } from './productTemplate';
import { buildProductTemplateAttributeValuePages } from './productTemplateAttributeValue';
import { buildProductVariantPages } from './productVariant';
import { buildPutawayRulePages } from './putawayRule';
import { buildStockQuantPages } from './stockQuant';
import { buildStockReservationPages } from './stockReservation';
import { buildStockScrapPages } from './stockScrap';
import { buildStockTransferPages } from './stockTransfer';
import { buildStorageCategoryPages } from './storageCategory';
import { buildSupplyRelationPages } from './supplyRelation';
import { buildWarehousePages } from './warehouse';
import * as c from '../constants';
import { ProductTemplateCommands } from '../features/productTemplate/commands';
import { ProductTemplateAttributeValueCommands } from '../features/productTemplateAttributeValue/commands';
import { ATTRIBUTE_VALUES, TEMPLATE_ATTRIBUTES } from '../viewkit/ids';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';
import type { RelatedResource } from '@nikkierp/viewkit-mantine/props';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'productTemplate', build: buildProductTemplatePages },
	{ name: 'productVariant', build: buildProductVariantPages },
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
	{ name: 'stockReservation', build: buildStockReservationPages },
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
	 * Every action resolves to the code the backend asserts, or the button is not locked for a user
	 * the server refuses. A custom verb needs an explicit `actionCode` from the application service.
	 */
	it.each(allPages)('$name pages declare no ungated action', ({ build }) => {
		expect(findUngatedActions(build())).toEqual([]);
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
	it('registers one route per resource, all snake_case, plus the import pilot pages', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual([
			'inventory_product_template', 'inventory_product_template/import',
			'inventory_product_variant', 'inventory_product_variant/import',
			'inventory_product_category', 'inventory_product_category/import',
			'inventory_brand', 'inventory_product_attribute', 'inventory_product_attribute_value', 'inventory_product_template_attribute_value',
			'inventory_location', 'inventory_warehouse', 'inventory_storage_category', 'inventory_warehouse_supply_relation', 'inventory_putaway_rule',
			'inventory_stock_quant', 'stock_balance_counts_due', 'inventory_stock_transfer',
			'inventory_stock_scrap', 'inventory_stock_reservation',
		]);
		for (const routePath of routePaths) {
			expect(routePath).toMatch(/^[a-z][a-z0-9_]*(\/import)?$/);
		}
	});

	/**
	 * The import pilot: each of the three product master lists shows the "Import" entry, and the
	 * page it navigates to sits at `{list}/import` and returns to that list. A static segment
	 * outranks the split view's `:id?`, so the order of declaration does not matter.
	 */
	it.each([
		{
			name: 'productTemplate', build: buildProductTemplatePages,
			route: 'inventory_product_template', schema: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		},
		{
			name: 'productVariant', build: buildProductVariantPages,
			route: 'inventory_product_variant', schema: c.PRODUCT_VARIANT_SCHEMA_NAME,
		},
		{
			name: 'productCategory', build: buildProductCategoryPages,
			route: 'inventory_product_category', schema: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		},
	])('$name declares the import pilot page beside its list', ({ build, route, schema }) => {
		const pages = build();
		const list = pages.find(page => page.routePath === route);
		const importPage = pages.find(page => page.routePath === `${route}/import`);

		const listProps = list?.props as { primary: { props: { importEnabled: boolean } } };
		expect(listProps.primary.props.importEnabled).toBe(true);
		expect(importPage?.template).toBe('nikkierp.mantine.pages.templates.resourceImport.v1');
		expect(importPage?.props).toMatchObject({ schemaName: schema, returnRoutePath: route });
	});

	// The columns are the backend's `default_search_fields`; the page only decides how they render.
	it('renders the product variant attributes as pills', () => {
		const [page] = buildProductVariantPages();
		const props = page.props as { primary: { props: { fieldRenderers: Record<string, unknown> } } };

		expect(props.primary.props.fieldRenderers.attribute_summary)
			.toEqual({ renderer: 'attributePills' });
	});

	it('nests both split-view panes as template refs', () => {
		const [page] = buildProductTemplatePages();
		const props = page.props as { primary: { template: string }, secondary: { template: string } };

		expect(page.template).toContain('resourceSplitView');
		expect(props.primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
		expect(props.secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
	});
});

describe('Inventory list and detail templates', () => {
	it.each(allPages)('$name pages render v2 list and detail templates', ({ build }) => {
		for (const page of build().filter(({ template }) => template?.includes('resourceSplitView'))) {
			const props = page.props as { primary: { template: string }, secondary: { template: string } };

			expect(props.primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
			expect(props.secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
		}
	});

	/**
	 * Inline row editing goes on master data only. Stock documents and balances change through
	 * their workflow actions, which a cell edit would bypass.
	 */
	it('enables inline row editing on master data, not on stock documents or balances', () => {
		const noInlineEdit = allPages
			.filter(({ build }) => !build().some(page => listPropsOf(page)?.updateCommand))
			.map(({ name }) => name);

		expect(noInlineEdit.sort()).toEqual([
			'stockQuant', 'stockReservation', 'stockScrap', 'stockTransfer',
		]);
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
		const tables = relatedTables(page);

		// Variants, prices, and the stock breakdown. Asserted by schema rather than by
		// count alone, so that adding a section is a deliberate change here rather than a number
		// quietly going up.
		//
		// The breakdown lists variants, not quants: a template holds no stock of its own, and a
		// quant cannot be reached from a template in one search anyway — `linked` traverses only a
		// many edge, and quant → variant is many:one. See CR §5.3 and §24.
		expect(tables.map(table => table.schemaName)).toEqual([
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
			expect(table.initialGraph).toEqual({ if: ['product_template_id', '=', '${id}'] });
		}
	});

	it('points the variants table at the variant page, not the current one', () => {
		const [page] = buildProductTemplatePages();
		const variantTable = relatedTables(page)
			.find(node => node.schemaName === c.PRODUCT_VARIANT_SCHEMA_NAME);

		expect(variantTable?.linkRoutePath).toBe('inventory_product_variant');
	});

	/**
	 * An enum renderer's `prefix` is what turns a stored enum value into an i18n key
	 * (`active` → `template_status.active`). Without it the raw value is displayed.
	 */
	it('keeps status renderers as serializable specs with their i18n prefix', () => {
		const [page] = buildProductTemplatePages();
		const props = page.props as { primary: { props: { fieldRenderers: Record<string, unknown> } } };

		expect(props.primary.props.fieldRenderers).toEqual({
			status: {
				renderer: 'enum',
				colorMap: { draft: 'gray', active: 'green', discontinued: 'red' },
				prefix: 'template_status.',
			},
			product_type: {
				renderer: 'enum',
				colorMap: { goods: 'blue', service: 'violet' },
				prefix: 'product_type.',
			},
			base_sales_price: { renderer: 'money' },
		});
	});
});

type TemplateDetailProps = {
	createNodes: ComponentNode[],
	childrenNodes: ComponentNode[],
	contextualActions: Record<string, { command?: string, actionCode?: string, prompt?: unknown, component?: string }>,
};

describe('Product template attribute configuration', () => {
	function detailProps() {
		const [page] = buildProductTemplatePages();
		return (page.props as { secondary: { props: TemplateDetailProps } }).secondary.props;
	}

	/**
	 * PROD-009: the lines are edited in a form section, so they ride the template's own save, and it
	 * sits right after General, above the related tabs. Create too: the create accepts them.
	 */
	it('edits the attributes in a section after General, on create and on update', () => {
		const { createNodes, childrenNodes } = detailProps();

		for (const nodes of [createNodes, childrenNodes]) {
			expect(nodes).toHaveLength(2);
			expect(nodes[0].props).toMatchObject({ header: 'form.generalInformation' });
			expect(nodes[1].props).toMatchObject({ header: 'product_template_sections_attributes' });
			expect(JSON.stringify(nodes[1])).toContain(TEMPLATE_ATTRIBUTES);
		}
	});

	it('no longer lists the read-only attribute junction as a related tab', () => {
		const [page] = buildProductTemplatePages();

		expect(relatedTables(page).map(table => table.schemaName))
			.not.toContain(c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME);
	});

	/** The codes are copied from the application service's AssertAction calls. */
	it('offers copy (with a name prompt) and re-sync, locked on the codes the backend asserts', () => {
		const { contextualActions } = detailProps();

		expect(contextualActions.copy).toMatchObject({
			command: ProductTemplateCommands.COPY, actionCode: 'copy',
			prompt: { fields: [{ name: 'name', required: false }] },
		});
		expect(contextualActions.resyncVariants).toMatchObject({
			command: ProductTemplateCommands.GENERATE_VARIANTS, actionCode: 'generate_variants',
		});
	});

	/** SFB-001 / IUX-001: Resolve variant left the page header for the Attributes table's toolbar. */
	it('keeps only Copy and Re-sync among the contextual actions', () => {
		const { contextualActions } = detailProps();

		expect(Object.keys(contextualActions)).toEqual(['copy', 'resyncVariants']);
	});

	/** SFB-002: "View variants" is the Variants tab's own link, filtered to the template. */
	it('links the Variants tab to the variant list filtered by the template', () => {
		const [variants] = relatedTables(buildProductTemplatePages()[0]);

		expect(variants).toMatchObject({
			label: 'product_template_sections_variants',
			linkRoutePath: 'inventory_product_variant',
			initialGraph: { if: ['product_template_id', '=', '${id}'] },
			showViewAll: true,
			viewAllFiltered: true,
			viewAllLabel: 'product_template_config_viewVariants',
			viewAllType: 'link',
		});
	});
});

describe('Product variant kinds', () => {
	/** PROD-023: complete variants by default; the filter panel switches to Base or All. */
	it('lists complete variants by default and badges the kind', () => {
		const [page] = buildProductVariantPages();
		const props = page.props as {
			primary: { props: { initialGraph: unknown, fieldRenderers: Record<string, { prefix?: string }> } },
		};

		expect(props.primary.props.initialGraph).toEqual({ if: ['variant_kind', '=', 'complete'] });
		expect(props.primary.props.fieldRenderers.variant_kind.prefix).toBe('variant_kind_label.');
	});

	it('shows the kind, the base and the eligibility on the variant form', () => {
		const [page] = buildProductVariantPages();
		const fields = collectComponents(page, 'resourceForm.column')
			.flatMap(node => (node.props?.fields as string[] | undefined) ?? []);

		expect(fields).toEqual(expect.arrayContaining(['variant_kind', 'base_variant_id', 'is_transaction_eligible']));
	});
});

describe('Product stock integration', () => {
	/**
	 * Product is an entry point onto stock, not an owner of it. Each section reads a resource
	 * another part of the module owns and links to the page that owns it (CR §4.4, §6.1).
	 */
	it('shows a variant its stock, its movements and its putaway rules', () => {
		const [page] = buildProductVariantPages();
		const tables = relatedTables(page);

		expect(tables.map(table => table.schemaName)).toEqual([
			c.STOCK_QUANT_SCHEMA_NAME,
			c.STOCK_MOVE_SCHEMA_NAME,
			c.PUTAWAY_RULE_SCHEMA_NAME,
		]);

		// Stock names the variant `product_variant_id`; a putaway rule calls the same reference
		// `product_id`, because Warehouse's rule may point at a product or a category. Each filter
		// has to use the field its own schema declares — a shared spelling would match nothing.
		expect(tables[0].initialGraph).toEqual({ if: ['product_variant_id', '=', '${id}'] });
		expect(tables[1].initialGraph).toEqual({ if: ['product_variant_id', '=', '${id}'] });
		expect(tables[2].initialGraph).toEqual({ if: ['product_id', '=', '${id}'] });
	});

	/**
	 * Quantities are read-only on a product page. No section names an update command, so there is
	 * no edit affordance to suppress and no path from Product to setting a balance (CR §6.2,
	 * AC-PROD-INT-034).
	 */
	it('binds no write command on any variant stock section', () => {
		const [page] = buildProductVariantPages();

		for (const table of relatedTables(page)) {
			expect(table).not.toHaveProperty('updateSaveCommand');
			expect(table).not.toHaveProperty('deleteCommand');
			expect(table).not.toHaveProperty('archiveCommand');
		}
	});

	/**
	 * The two tables listing the same schema on one page need distinct testId prefixes, or their
	 * rendered `data-testid`s collide and a test cannot tell one from the other.
	 */
	it('gives the template its own testId for the second variants table', () => {
		const [page] = buildProductTemplatePages();
		const variantTables = relatedTables(page)
			.filter(table => table.schemaName === c.PRODUCT_VARIANT_SCHEMA_NAME);

		expect(variantTables).toHaveLength(2);
		expect(variantTables[1].testId).toBe('inventory.templateInventory');
	});

	/** Category-level putaway rules, shown where the category is (CR §10.2, TS-PROD-14). */
	it('shows a category the putaway rules that match it', () => {
		const [page] = buildProductCategoryPages();
		const putaway = relatedTables(page)
			.find(table => table.schemaName === c.PUTAWAY_RULE_SCHEMA_NAME);

		expect(putaway?.initialGraph).toEqual({ if: ['product_category_id', '=', '${id}'] });
		expect(putaway?.linkRoutePath).toBe('inventory_putaway_rule');
	});
});

describe('Product attribute detail', () => {
	function detailNodes(): { createNodes: ComponentNode[], childrenNodes: ComponentNode[] } {
		const [page] = buildProductAttributePages();
		const props = page.props as {
			secondary: { props: { createNodes: ComponentNode[], childrenNodes: ComponentNode[] } },
		};
		return props.secondary.props;
	}

	/**
	 * The values are edited inline and saved with the attribute (PROD-001), in create as well as in
	 * update mode, so the section sits in both form bodies rather than in the update-only related tabs.
	 */
	it('edits the attribute values in a form section, on create and on update', () => {
		const { createNodes, childrenNodes } = detailNodes();

		for (const nodes of [createNodes, childrenNodes]) {
			const sections = nodes.filter(node => JSON.stringify(node).includes(ATTRIBUTE_VALUES));
			expect(sections).toHaveLength(1);
			expect(sections[0].props).toMatchObject({ header: 'product_attribute_values_section' });
		}
	});

	it('keeps the related values tab as read-only navigation to the value page', () => {
		const [page] = buildProductAttributePages();
		const [values] = relatedTables(page);

		expect(values.schemaName).toBe(c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME);
		expect(values.linkRoutePath).toBe('inventory_product_attribute_value');
		expect(values).not.toHaveProperty('assignment');
	});

	/** PROD-005: the mode is shown locked, not hidden, while a template applies the attribute. */
	it('locks the variant creation mode on can_change_variant_creation', () => {
		const [page] = buildProductAttributePages();
		const columns = collectComponents(page, 'resourceForm.column')
			.filter(node => (node.props as { fields?: string[] }).fields?.includes('variant_creation_mode'));

		expect(columns.length).toBeGreaterThan(0);
		for (const column of columns) {
			expect((column.props as { lockedFields?: unknown }).lockedFields).toEqual({
				variant_creation_mode: { unless: 'can_change_variant_creation', hint: 'product_attribute_modeLockedHint' },
			});
		}
	});

	it('renders the variant creation mode and display type as coloured badges', () => {
		const [page] = buildProductAttributePages();
		const props = page.props as { secondary: { props: { fieldRenderers: Record<string, { prefix?: string }> } } };

		expect(props.secondary.props.fieldRenderers.variant_creation_mode.prefix).toBe('variant_creation_mode.');
		expect(props.secondary.props.fieldRenderers.display_type.prefix).toBe('display_type.');
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
		const props = countsDuePage.props as { primary: { props: { initialGraph?: unknown } } };

		expect(countsDuePage.routePath).toBe('stock_balance_counts_due');
		expect(props.primary.props.initialGraph).toEqual({ if: ['next_count_date', '<=', '${today}'] });
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
		const tables = relatedTables(page);

		expect(tables.map(table => table.schemaName)).toEqual([
			c.STOCK_MOVE_SCHEMA_NAME,
			c.STOCK_MOVE_LINE_SCHEMA_NAME,
		]);
		for (const table of tables) {
			expect(table.initialGraph).toEqual({ if: ['transfer_id', '=', '${id}'] });
		}
	});

	it('binds the page to the backend stock transfer schema', () => {
		const [page] = buildStockTransferPages();
		const props = page.props as { primary: { props: { schemaName: string } } };

		expect(props.primary.props.schemaName).toBe('inventory_stock_transfer');
		expect(props.primary.props.schemaName).toBe(c.STOCK_TRANSFER_SCHEMA_NAME);
	});
});

/** The related-resource tabs of a split view's detail pane. */
function relatedTables(page: PageNode): RelatedResource[] {
	const props = page.props as { secondary?: { props?: { relatedResources?: RelatedResource[] } } };
	return props.secondary?.props?.relatedResources ?? [];
}

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

/** A list page's props, whether it stands alone or is the primary pane of a split view. */
function listPropsOf(page: PageNode): Record<string, unknown> | undefined {
	const props = page.props as { primary?: { props?: Record<string, unknown> } } & Record<string, unknown>;
	return page.template === RESOURCE_LIST_V2_TEMPLATE ? props : props.primary?.props;
}

describe('Template attribute value page', () => {
	/**
	 * A schema name that disagrees with the backend Go constant does not error — it leaves the page
	 * on its loading spinner forever, because the registry simply never resolves it. Pinned as a
	 * literal so the assertion is against the real string rather than the constant against itself.
	 */
	it('is a list of the backend junction schema, with no detail pane and no row link', () => {
		const [page] = buildProductTemplateAttributeValuePages();
		const props = listPropsOf(page);

		expect(page.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
		expect(props?.schemaName).toBe('inventory_product_template_attribute_value');
		expect(props).not.toHaveProperty('linkField');
	});

	/**
	 * The whole reason this page exists: `sales_price_extra` lives on this junction, and the row's
	 * update accepts it and nothing else, so the list edits that one column inline and offers no
	 * create or delete. The selection is written only through the template's own save.
	 */
	it('edits sales_price_extra inline and nothing else', () => {
		const props = listPropsOf(buildProductTemplateAttributeValuePages()[0]);

		expect(props?.updateCommand).toBe(ProductTemplateAttributeValueCommands.UPDATE);
		expect(props?.editableFields).toEqual(['sales_price_extra']);
		expect(props?.createEnabled).toBe(false);
		expect(props).not.toHaveProperty('deleteCommand');
	});

	// The backend asserts `update_value` on the attribute, not `update` on the junction (PFU-010).
	it('locks the extra price editor on update_value of the product attribute', () => {
		const props = listPropsOf(buildProductTemplateAttributeValuePages()[0]);

		expect(props?.updateActionCode).toBe('update_value');
		expect(props?.updateActionResource).toBe('inventory_product_attribute');
	});

	it('orders the values as the template does and shows a missing extra price as 0', () => {
		const props = listPropsOf(buildProductTemplateAttributeValuePages()[0]);

		expect(props?.initialGraph).toEqual({ order: [['sequence', 'asc']] });
		expect(props?.fieldRenderers).toEqual({ sales_price_extra: { renderer: 'money', blankAsZero: true } });
	});
});
