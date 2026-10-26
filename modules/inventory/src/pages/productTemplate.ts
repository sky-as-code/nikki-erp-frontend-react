import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFileFieldNode, resourceFormColumnNode, resourceImportProps,
	resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductTemplateCommands } from '../features/productTemplate/commands';
import { ProductVariantCommands } from '../features/productVariant/commands';
import { StockProductConfigCommands } from '../features/stockProductConfig/commands';
import { templateAttributesNode } from '../viewkit/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** No currency field of its own: amounts are in the organization's currency. */
const MONEY_RENDERER = { renderer: 'money' };
const FLOAT_RENDERER = { renderer: 'float' };

export function buildProductTemplatePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductTemplateListProps(),
		secondary: buildProductTemplateDetailProps(),
	});
	// Import pilot: the list's "Import" entry navigates here. Static, so it outranks `:id`.
	const importPage = resourceImportProps({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		returnRoutePath: 'inventory_product_template',
	});

	return [
		definePage({ routePath: 'inventory_product_template', template: splitView.template, props: splitView.props }),
		definePage({ routePath: 'inventory_product_template/import', template: importPage.template, props: importPage.props }),
	];
}

function buildProductTemplateListProps() {
	return resourceListV2Props({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductTemplateCommands.SEARCH,
		createEnabled: true,
		importEnabled: true,
		deleteCommand: ProductTemplateCommands.DELETE,
		// BR-PROD-TPL-005: a template that owns variants is archived, never deleted, so that
		// transactions referencing those variants keep their meaning.
		archiveCommand: ProductTemplateCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductTemplateCommands.UPDATE,
		updateCommand: ProductTemplateCommands.UPDATE,
		fieldRenderers: {
			...buildProductTemplateEnumRenderers(),
			base_sales_price: MONEY_RENDERER,
		},
	});
}

function buildProductTemplateEnumRenderers() {
	return {
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
	};
}

function buildProductTemplateDetailRenderers() {
	return {
		...buildProductTemplateEnumRenderers(),
		base_sales_price: MONEY_RENDERER,
		min_variant_cost: MONEY_RENDERER,
		max_variant_cost: MONEY_RENDERER,
		default_weight: FLOAT_RENDERER,
		default_length: FLOAT_RENDERER,
		default_width: FLOAT_RENDERER,
		default_height: FLOAT_RENDERER,
	};
}

function buildProductTemplateDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'short_name' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: buildProductTemplateDetailRenderers(),
		standardActionCommands: {
			getById: ProductTemplateCommands.GET_BY_ID,
			create: ProductTemplateCommands.CREATE,
			update: ProductTemplateCommands.UPDATE,
			delete: ProductTemplateCommands.DELETE,
			archive: ProductTemplateCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildTemplateContextualActions(),
		createNodes: [buildProductTemplateFieldsSection(), buildTemplateAttributesSection()],
		childrenNodes: [buildProductTemplateFieldsSection(), buildTemplateAttributesSection()],
		relatedResources: buildTemplateResources(),
	});
}

/**
 * The attribute configuration, between General and the related tabs. A form section rather than a
 * related tab: its lines and exclusions are written only through the template's own create or
 * update (the junction resources are read-only), in the same request as the template's fields.
 */
function buildTemplateAttributesSection(): ComponentNode {
	return collapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		header: 'product_template_sections_attributes',
	}, [templateAttributesNode()]);
}

/**
 * Copy creates a new template with the active configuration (no stock, SKUs or variants), and
 * asserts `copy` besides the create it performs; on success it says so and opens the copy. Re-sync
 * re-runs the variant reconcile of the saved configuration, asserting `generate_variants`. Resolve
 * variant is not here: it sits in the Attributes table's toolbar, beside the lines it acts on.
 */
function buildTemplateContextualActions() {
	return {
		copy: {
			label: 'actions.copy',
			command: ProductTemplateCommands.COPY,
			actionCode: 'copy',
			prompt: {
				title: 'product_template_copyTitle',
				fields: [{ name: 'name', required: false }],
			},
			successNotice: 'product_template_copied',
			openResult: true,
		},
		resyncVariants: {
			label: 'actions.resync_variants',
			command: ProductTemplateCommands.GENERATE_VARIANTS,
			actionCode: 'generate_variants',
		},
	};
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductTemplateFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		...buildProductTemplateIdentityColumns(),
		...buildProductTemplateCommercialColumns(),
		...buildProductTemplatePhysicalColumns(),
	]);
}

function buildProductTemplateIdentityColumns(): ComponentNode[] {
	return [
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['name', 'short_name', 'product_type', 'is_combo', 'category_id', 'brand_id'],
		}),
	];
}

function buildProductTemplateCommercialColumns(): ComponentNode[] {
	return [
		resourceFormColumnNode({
			// sale_ok and purchase_ok decide which business processes may reference the product,
			// which is what makes them belong beside their descriptions rather than in general
			// information. See BR Â§2.4.
			header: 'form.sales',
			fields: ['sale_ok', 'sales_description', 'base_sales_price'],
		}),
		resourceFormColumnNode({
			header: 'form.purchasing',
			fields: ['purchase_ok', 'uom_id', 'purchase_description'],
		}),
		resourceFormColumnNode({
			// The template holds no cost of its own, deliberately: cost belongs to the variant,
			// because two variants of one product routinely cost different amounts. What the
			// template can honestly show is the RANGE across its variants, so these two fields
			// together read as "60,000 - 100,000" when they differ and as one figure when they
			// agree.
			//
			// Both are computed and virtual, so they render read-only here and are dropped from
			// the create form entirely — a product with no variants yet has no range to show.
			// That is the same treatment created_at and updated_at get, and it needs no
			// page-side flag because there is none to give: read-only comes from the backend
			// schema's field metadata.
			header: 'form.costing',
			fields: ['min_variant_cost', 'max_variant_cost'],
		}),
	];
}

function buildProductTemplatePhysicalColumns(): ComponentNode[] {
	return [
		resourceFormColumnNode({
			// Defaults a variant inherits when it sets no value of its own. See BR Â§6.4.
			header: 'form.dimensions',
			fields: ['default_weight', 'default_length', 'default_width', 'default_height'],
		}),
		resourceFileFieldNode({
			field: 'default_image',
			pathField: 'default_image_file_path',
			label: 'fields.default_image_file_path',
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['status', 'created_at', 'updated_at'],
		}),
	];
}

/**
 * The variants the template produces, its vendor prices and stock. The attribute configuration
 * is the form section above, not a tab here.
 *
 * Each is filtered by the current record's id: `${id}` is replaced with the route param at
 * render time. They render only in update mode, since during create there is no id to filter by.
 */
function buildTemplateResources() {
	return [
		{
			label: 'product_template_sections_variants',
			schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: ProductVariantCommands.SEARCH,
			initialGraph: { if: ['product_template_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'inventory_product_variant',
			// "View variants": the variant list filtered to this template, hidden in update mode.
			showViewAll: true,
			viewAllFiltered: true,
			viewAllLabel: 'product_template_config_viewVariants',
			viewAllType: 'link' as const,
		},
		{
			label: 'product_template_sections_vendor_prices',
			// Purchase's resource, shown on Inventory's page, with NO import from Purchase.
			// Command names are derived from the schema string alone, so naming the schema is
			// enough to reach the owning module's service — and it has to be, because the root
			// eslint config bans a module from importing another ("Modules must not import each
			// other. Communicate via the command bus."). Hence the literal below rather than a
			// constant borrowed from purchase/.
			//
			// It must match the Go constant verbatim: a mismatch does not error, it leaves the
			// section spinning forever.
			schemaName: 'purchase_vendor_product_price',
			translationNs: c.INVENTORY_MODULE,
			searchCommand: resourceCommands('purchase_vendor_product_price').SEARCH,
			// What every vendor offers this product, at any quantity — the buyer's comparison
			// view. Filtered by template rather than variant because a template-wide quote
			// prices every variant that has none of its own.
			initialGraph: { if: ['product_template_id', '=', '${id}'] },
			linkField: 'id',
			// The row links into the `purchase` module, which owns this schema; `linkRoutePath`
			// is resolved against the *current* module, so the module segment is named here.
			// Pre-existing defect: this read `vendor_product_prices`, a path `inventory` never
			// registered, so every row linked to a 404.
			linkRoutePath: '/purchase/purchase_vendor_product_price',
		},
		buildTemplateInventoryResource(),
		buildInventoryUomResource(),
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
function buildInventoryUomResource() {
	return {
		label: 'product_template_sections_inventoryUom',
		schemaName: c.STOCK_PRODUCT_CONFIG_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: StockProductConfigCommands.SEARCH,
		initialGraph: { if: ['product_template_id', '=', '${id}'] },
		fields: ['inventory_uom_id'],
		linkField: 'id',
	};
}

/**
 * The stock behind a template, broken down by variant (CR Â§5.3, Â§24).
 *
 * It lists the variants rather than the quants. A template holds no stock of its own and never
 * will â€” only a variant is stocked (CR Â§5.1, PROD-INT-INV-002) â€” so the honest breakdown is one
 * row per variant, each linking to the variant page where its balances are shown in full.
 *
 * Quants cannot be listed here directly. `initialGraph` reaches a related resource only across a
 * *many* edge via the `linked` operator, and quant â†’ variant is many:one, so there is no path from
 * a template to its variants' quants in one search. The aggregate is served by the
 * `template_stock_summary` action instead, which sums the variants server-side.
 *
 * Every action needing a concrete product lives on the variant page this links to, not here. That
 * is what stops a stock command being issued with a template id: the template page emits none
 * (CR Â§7, AC-PROD-INT-012, AC-PROD-INT-013, TS-PROD-01).
 */
function buildTemplateInventoryResource() {
	return {
		label: 'product_template_sections_inventory',
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: ProductVariantCommands.SEARCH,
		initialGraph: { if: ['product_template_id', '=', '${id}'] },
		fields: ['sku', 'combination_key', 'status'],
		linkField: 'id',
		linkRoutePath: 'inventory_product_variant',
		// A second variants table on one page, so it needs its own testId prefix to avoid
		// colliding with the configuration tab before it.
		testId: 'inventory.templateInventory',
	};
}
