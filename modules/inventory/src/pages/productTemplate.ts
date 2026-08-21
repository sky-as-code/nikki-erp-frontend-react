import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductPriceCommands } from '../features/productPrice/commands';
import { ProductTemplateCommands } from '../features/productTemplate/commands';
import { ProductTemplateAttributeCommands } from '../features/productTemplateAttribute/commands';
import { ProductVariantCommands } from '../features/productVariant/commands';
import { StockProductConfigCommands } from '../features/stockProductConfig/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductTemplatePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductTemplateListProps(),
		secondary: buildProductTemplateDetailProps(),
	});

	return [definePage({
		routePath: 'product_templates',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductTemplateListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductTemplateCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductTemplateCommands.DELETE,
		// BR-PROD-TPL-005: a template that owns variants is archived, never deleted, so that
		// transactions referencing those variants keep their meaning.
		archiveCommand: ProductTemplateCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductTemplateCommands.UPDATE,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', active: 'green', discontinued: 'orange' },
				prefix: 'template_status.',
			},
		},
	});
}

function buildProductTemplateDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'short_name' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductTemplateCommands.GET_BY_ID,
			create: ProductTemplateCommands.CREATE,
			update: ProductTemplateCommands.UPDATE,
			delete: ProductTemplateCommands.DELETE,
			archive: ProductTemplateCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildProductTemplateFieldsSection()],
		childrenNodes: [buildProductTemplateFieldsSection(), ...buildTemplateSections()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductTemplateFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['name', 'short_name', 'status', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.identification',
				fields: ['product_type_id', 'category_id', 'brand_id'],
			}),
			resourceFormColumnNode({
				// sale_ok and purchase_ok decide which business processes may reference the product,
				// which is what makes them belong beside their descriptions rather than in general
				// information. See BR Â§2.4.
				header: 'form.sales',
				fields: ['sale_ok', 'sales_description'],
			}),
			resourceFormColumnNode({
				header: 'form.purchasing',
				fields: ['purchase_ok', 'purchase_description'],
			}),
			resourceFormColumnNode({
				// Defaults a variant inherits when it sets no value of its own. See BR Â§6.4.
				header: 'form.dimensions',
				fields: ['default_weight', 'default_length', 'default_width', 'default_height'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * The template's attribute configuration and the variants it produces.
 *
 * Both are filtered by the current record's id: `${id}` is replaced with the route param at
 * render time. They render only in update mode, since during create there is no id to filter by.
 */
function buildTemplateSections(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'product_template_sections_attributes', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductTemplateAttributeCommands.SEARCH,
				filterGraph: { if: ['product_template_id', '=', '${id}'] },
				linkField: 'id',
			})],
		),
		collapsibleSectionNode(
			{ header: 'product_template_sections_variants', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductVariantCommands.SEARCH,
				filterGraph: { if: ['product_template_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'product_variants',
			})],
		),
		collapsibleSectionNode(
			{ header: 'product_template_sections_prices', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_PRICE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductPriceCommands.SEARCH,
				// Only the template's own rules. A variant's price rule belongs to that variant's
				// page, since it exists precisely to differ from the line's base price.
				filterGraph: { if: ['product_template_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'product_prices',
			})],
		),
		buildTemplateInventorySection(),
		buildInventoryUomSection(),
	];
}

/**
 * The unit this product line's stock is counted in (CR Â§11).
 *
 * Configured here because this is where a user works, but owned by Stock: it decides what a
 * balance means, and the row lives in its own resource rather than as a column on the template
 * (CR Â§11.3, Â§11.4). Every variant inherits it and none may override it in this change request
 * (CR Â§11.5, PROD-INT-INV-011, PROD-INT-INV-012, TS-PROD-06).
 *
 * The UoM master itself â€” categories, factors, rounding, conversion â€” stays in the Essential
 * module and is not reproduced anywhere in Product (CR Â§11.1, PROD-INT-INV-009).
 *
 * Changing the unit after the product has moved stock is refused by the server, because it would
 * reinterpret every quantity ever recorded against it (CR Â§12.2, TS-PROD-09). That rule is not
 * restated here: it has one home, and a copy in the client could only drift from it.
 */
function buildInventoryUomSection(): ComponentNode {
	return collapsibleSectionNode(
		{
			header: 'product_template_sections_inventoryUom',
			translationNs: c.INVENTORY_MODULE,
			expanded: false,
		},
		[resourceTableNode({
			schemaName: c.STOCK_PRODUCT_CONFIG_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: StockProductConfigCommands.SEARCH,
			filterGraph: { if: ['product_template_id', '=', '${id}'] },
			fields: ['inventory_uom_id'],
			linkField: 'id',
		})],
	);
}

/**
 * The stock behind a template, broken down by variant (CR Â§5.3, Â§24).
 *
 * It lists the variants rather than the quants. A template holds no stock of its own and never
 * will â€” only a variant is stocked (CR Â§5.1, PROD-INT-INV-002) â€” so the honest breakdown is one
 * row per variant, each linking to the variant page where its balances are shown in full.
 *
 * Quants cannot be listed here directly. `filterGraph` reaches a related resource only across a
 * *many* edge via the `linked` operator, and quant â†’ variant is many:one, so there is no path from
 * a template to its variants' quants in one search. The aggregate is served by the
 * `template_stock_summary` action instead, which sums the variants server-side.
 *
 * Every action needing a concrete product lives on the variant page this links to, not here. That
 * is what stops a stock command being issued with a template id: the template page emits none
 * (CR Â§7, AC-PROD-INT-012, AC-PROD-INT-013, TS-PROD-01).
 */
function buildTemplateInventorySection(): ComponentNode {
	return collapsibleSectionNode(
		{ header: 'product_template_sections_inventory', translationNs: c.INVENTORY_MODULE, expanded: false },
		[resourceTableNode({
			schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: ProductVariantCommands.SEARCH,
			filterGraph: { if: ['product_template_id', '=', '${id}'] },
			fields: ['sku', 'combination_key', 'status'],
			linkField: 'id',
			linkRoutePath: 'product_variants',
			// A second variants table on one page, so it needs its own testId prefix to avoid
			// colliding with the configuration section above.
			testId: 'inventory.templateInventory',
		})],
	);
}
