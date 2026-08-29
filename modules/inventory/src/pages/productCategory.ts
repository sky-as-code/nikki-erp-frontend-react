import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductCategoryCommands } from '../features/productCategory/commands';
import { ProductTemplateCommands } from '../features/productTemplate/commands';
import { PutawayRuleCommands } from '../features/putawayRule/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductCategoryPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductCategoryListProps(),
		secondary: buildProductCategoryDetailProps(),
	});

	return [definePage({
		routePath: 'product_categories',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductCategoryListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductCategoryCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductCategoryCommands.DELETE,
		archiveCommand: ProductCategoryCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductCategoryCommands.UPDATE,
	});
}

function buildProductCategoryDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductCategoryCommands.GET_BY_ID,
			create: ProductCategoryCommands.CREATE,
			update: ProductCategoryCommands.UPDATE,
			delete: ProductCategoryCommands.DELETE,
			archive: ProductCategoryCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildProductCategoryFieldsSection()],
		childrenNodes: [buildProductCategoryFieldsSection(), ...buildCategoryProductsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductCategoryFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					// The backend rejects a category that is its own ancestor; the generated form cannot
					// express that, so `product_category.cycle` is what the user sees on save.
					header: 'form.generalInformation',
					fields: ['name', 'code', 'parent_category_id', 'sequence', 'org_id'],
				}),
			},
			{
				key: 'identification',
				header: 'form.identification',
				content: resourceFormColumnNode({
					header: 'form.identification',
					fields: ['description'],
				}),
			},
			{
				key: 'audit',
				header: 'form.audit',
				content: resourceFormColumnNode({
					header: 'form.audit',
					fields: ['created_at', 'updated_at'],
				}),
			},
		],
	});
}

/** The products filed under this category, and the putaway rules that apply to them. */
function buildCategoryProductsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'menu_products', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductTemplateCommands.SEARCH,
				filterGraph: { if: ['category_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'product_templates',
			})],
		),
		// Rules that place goods by category rather than by individual product (CR Â§10.2,
		// AC-PROD-INT-020, TS-PROD-14). Read-only here: a putaway rule belongs to Warehouse, and
		// this section shows and links to it without letting Product create a competing copy
		// (CR Â§10.1, PROD-INT-INV-020, PROD-INT-INV-021).
		collapsibleSectionNode(
			{
				header: 'product_category_sections_putawayRules',
				translationNs: c.INVENTORY_MODULE,
				expanded: false,
			},
			[resourceTableNode({
				schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: PutawayRuleCommands.SEARCH,
				filterGraph: { if: ['product_category_id', '=', '${id}'] },
				fields: [
					'code', 'warehouse_id', 'source_location_id',
					'destination_location_id', 'priority',
				],
				linkField: 'id',
				linkRoutePath: 'putaway_rules',
			})],
		),
	];
}
