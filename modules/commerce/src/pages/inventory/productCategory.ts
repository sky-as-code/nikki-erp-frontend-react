import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceImportProps, resourceListV2Props,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { ProductCategoryCommands } from '../../features/inventory/productCategory/commands';
import { ProductTemplateCommands } from '../../features/inventory/productTemplate/commands';
import { PutawayRuleCommands } from '../../features/inventory/putawayRule/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductCategoryPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductCategoryListProps(),
		secondary: buildProductCategoryDetailProps(),
	});
	// Import pilot: the list's "Import" entry navigates here. Static, so it outranks `:id`.
	const importPage = resourceImportProps({
		schemaName: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		returnRoutePath: 'inventory_product_category',
	});

	return [
		definePage({ routePath: 'inventory_product_category', template: splitView.template, props: splitView.props }),
		definePage({ routePath: 'inventory_product_category/import', template: importPage.template, props: importPage.props }),
	];
}

function buildProductCategoryListProps() {
	return resourceListV2Props({
		schemaName: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductCategoryCommands.SEARCH,
		createEnabled: true,
		importEnabled: true,
		deleteCommand: ProductCategoryCommands.DELETE,
		archiveCommand: ProductCategoryCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductCategoryCommands.UPDATE,
		updateCommand: ProductCategoryCommands.UPDATE,
	});
}

function buildProductCategoryDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'canonical_name' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductCategoryCommands.GET_BY_ID,
			create: ProductCategoryCommands.CREATE,
			update: ProductCategoryCommands.UPDATE,
			delete: ProductCategoryCommands.DELETE,
			archive: ProductCategoryCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildProductCategoryFieldsSection()],
		childrenNodes: [buildProductCategoryFieldsSection()],
		relatedResources: buildCategoryResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductCategoryFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			// The backend rejects a category that is its own ancestor; the generated form cannot
			// express that, so `product_category.cycle` is what the user sees on save.
			header: 'form.generalInformation',
			fields: ['name', 'description', 'parent_category_id', 'display_order'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['created_at', 'created_by', 'updated_at'],
		}),
	]);
}

/** The products filed under this category, and the putaway rules that apply to them. */
function buildCategoryResources() {
	return [
		{
			label: 'menu_products',
			schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: ProductTemplateCommands.SEARCH,
			initialGraph: { if: ['category_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'inventory_product_template',
		},
		// Rules that place goods by category rather than by individual product (CR Â§10.2,
		// AC-PROD-INT-020, TS-PROD-14). Read-only here: a putaway rule belongs to Warehouse, and
		// this section shows and links to it without letting Product create a competing copy
		// (CR Â§10.1, PROD-INT-INV-020, PROD-INT-INV-021).
		{
			label: 'product_category_sections_putawayRules',
			schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: PutawayRuleCommands.SEARCH,
			initialGraph: { if: ['product_category_id', '=', '${id}'] },
			fields: [
				'code', 'warehouse_id', 'source_location_id',
				'destination_location_id', 'priority',
			],
			linkField: 'id',
			linkRoutePath: 'inventory_putaway_rule',
		},
	];
}
