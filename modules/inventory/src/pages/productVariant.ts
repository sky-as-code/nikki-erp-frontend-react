import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceImportProps, resourceListV2Props,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductVariantCommands } from '../features/productVariant/commands';
import { PutawayRuleCommands } from '../features/putawayRule/commands';
import { StockMoveCommands } from '../features/stockMove/commands';
import { StockQuantCommands } from '../features/stockQuant/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductVariantPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductVariantListProps(),
		secondary: buildProductVariantDetailProps(),
	});
	// Import pilot: the list's "Import" entry navigates here. Static, so it outranks `:id`.
	const importPage = resourceImportProps({
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		returnRoutePath: 'inventory_product_variant',
	});

	return [
		definePage({ routePath: 'inventory_product_variant', template: splitView.template, props: splitView.props }),
		definePage({ routePath: 'inventory_product_variant/import', template: importPage.template, props: importPage.props }),
	];
}

function buildProductVariantListProps() {
	return resourceListV2Props({
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductVariantCommands.SEARCH,
		createEnabled: true,
		importEnabled: true,
		deleteCommand: ProductVariantCommands.DELETE,
		archiveCommand: ProductVariantCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductVariantCommands.UPDATE,
		updateCommand: ProductVariantCommands.UPDATE,
		fieldRenderers: {
			attribute_summary: { renderer: 'attributePills' },
			status: {
				renderer: 'badge',
				colorMap: { active: 'green', discontinued: 'orange' },
				prefix: 'variant_status.',
			},
			archive_source: {
				renderer: 'badge',
				colorMap: { user: 'red', template_cascade: 'gray', system_sync: 'blue' },
				prefix: 'archive_source.',
			},
		},
	});
}

function buildProductVariantDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'product_template_name' },
		titleLvl2: { schemaField: 'sku' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductVariantCommands.GET_BY_ID,
			create: ProductVariantCommands.CREATE,
			update: ProductVariantCommands.UPDATE,
			delete: ProductVariantCommands.DELETE,
			archive: ProductVariantCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildProductVariantFieldsSection()],
		childrenNodes: [buildProductVariantFieldsSection()],
		relatedResources: buildVariantStockResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks laid out side by side. */
function buildProductVariantFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['sku', 'primary_barcode', 'combination_key', 'product_template_id'],
		}),
		// Three fields that are deliberately three different things.
		//
		// `cost` is what the business values this variant at, and it is the only one a user
		// types. It lives on the variant rather than the template because two variants of
		// one product routinely cost different amounts.
		//
		// `template_base_sales_price` and `effective_base_sales_price` are both computed and
		// read-only: the first is what the template asks for the product, the second adds
		// what this variant's attribute values charge on top of it. Showing both is what
		// makes the difference legible — a variant priced above its template is answering
		// "because of the options", and one number alone cannot say that.
		//
		// A selling price is NOT here. What a customer pays is resolved from a Sales price
		// list, and these are only the inputs to it.
		resourceFormColumnNode({
			header: 'form.pricing',
			fields: ['cost', 'template_base_sales_price', 'effective_base_sales_price'],
		}),
		// Left empty, each of these inherits the template's default. Null means "inherited",
		// never zero. See BR Â§6.4.
		resourceFormColumnNode({
			header: 'form.dimensions',
			fields: ['weight', 'length', 'width', 'height'],
		}),
		// archive_source is what lets unarchiving a template restore only the variants it
		// took down, so it is shown rather than hidden. See BR Â§8.9.
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['status', 'is_materialized', 'archive_source', 'created_at', 'updated_at'],
		}),
	]);
}

/**
 * The stock a variant holds, where it sits, how it has moved and where it gets put away.
 *
 * Product owns none of this. Each related tab reads a resource another part of the module owns and
 * links through to the page that does own it, so a user sees the stock without Product acquiring
 * a copy of it (CR Â§4.4, Â§6.1, Â§9). Nothing here offers a write: no tab names an update
 * command, so there is no edit affordance to suppress and no way to set a balance from a product
 * page (CR Â§6.2, AC-PROD-INT-034).
 *
 * They render only in update mode, which is correct: on `/product_variants/new` there is no id to
 * filter by, and a variant that does not exist yet holds no stock.
 *
 * The quantities are shown as the quant rows that make them up rather than as one summary line.
 * A related tab renders rows of a registered schema â€” it resolves a `modelSchema` and feeds a
 * paged search into `ExcelDataTable` â€” and a computed on-hand/reserved/available record belongs to no
 * schema. The rows carry the same numbers, per location. The scalar
 * form is served by the `variant_stock_summary` action, which the list columns use.
 */
function buildVariantStockResources() {
	return [
		buildVariantInventoryResource(),
		buildVariantMovementsResource(),
		buildVariantPutawayResource(),
	];
}

/** What the variant holds, and where. Rows link to the Stock Balance page that owns them. */
function buildVariantInventoryResource() {
	return {
		label: 'product_variant_sections_inventory',
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: StockQuantCommands.SEARCH,
		initialGraph: { if: ['product_variant_id', '=', '${id}'] },
		// The location's own status is on the location, not the quant, so a suspended
		// place is badged on the Stock Balance page this links to (TS-PROD-05).
		fields: [
			'location_id', 'on_hand_quantity', 'reserved_quantity',
			'available_quantity', 'base_uom_id', 'lot_ref',
		],
		linkField: 'id',
		linkRoutePath: 'inventory_stock_quant',
		testId: 'inventory.variantInventory',
	};
}

/** How the variant has moved, open and completed alike. */
function buildVariantMovementsResource() {
	return {
		label: 'product_variant_sections_movements',
		schemaName: c.STOCK_MOVE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: StockMoveCommands.SEARCH,
		initialGraph: { if: ['product_variant_id', '=', '${id}'] },
		fields: [
			'status', 'demand_quantity', 'source_location_id',
			'destination_location_id', 'scheduled_at',
		],
		// Rows point at the transfer that carries them: a move has no page of its own,
		// and the transfer is the document a user acts on.
		linkField: 'transfer_id',
		linkRoutePath: 'inventory_stock_transfer',
		testId: 'inventory.variantMovements',
	};
}

/** Where arriving goods of this product get put (CR Â§10). Read-only: the rules belong to Warehouse. */
function buildVariantPutawayResource() {
	return {
		label: 'product_variant_sections_putaway',
		schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: PutawayRuleCommands.SEARCH,
		// Rules naming this specific product. A rule that matches by category applies to
		// it too and is shown on the category page instead, where it is owned (CR Â§10.2).
		initialGraph: { if: ['product_id', '=', '${id}'] },
		fields: [
			'code', 'warehouse_id', 'source_location_id',
			'destination_location_id', 'priority',
		],
		linkField: 'id',
		linkRoutePath: 'inventory_putaway_rule',
		testId: 'inventory.variantPutaway',
	};
}
