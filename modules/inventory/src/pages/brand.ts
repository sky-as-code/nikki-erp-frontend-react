import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { BrandCommands } from '../features/brand/commands';
import { ProductTemplateCommands } from '../features/productTemplate/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildBrandPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildBrandListProps(),
		secondary: buildBrandDetailProps(),
	});

	return [definePage({
		routePath: 'brands',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildBrandListProps() {
	return resourceListProps({
		schemaName: c.BRAND_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: BrandCommands.SEARCH,
		createEnabled: true,
		deleteCommand: BrandCommands.DELETE,
		archiveCommand: BrandCommands.SET_IS_ARCHIVED,
		updateSaveCommand: BrandCommands.UPDATE,
	});
}

function buildBrandDetailProps() {
	return resourceDetailProps({
		schemaName: c.BRAND_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: BrandCommands.GET_BY_ID,
			create: BrandCommands.CREATE,
			update: BrandCommands.UPDATE,
			delete: BrandCommands.DELETE,
			archive: BrandCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildBrandFieldsSection()],
		childrenNodes: [buildBrandFieldsSection(), ...buildBrandProductsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildBrandFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['name', 'code', 'description', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.identification',
				fields: ['website', 'logo_id', 'country_id'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}

/** The products carrying this brand. */
function buildBrandProductsSection(): ComponentNode[] {
	return [collapsibleSectionNode(
		{ header: 'menu_products', translationNs: c.INVENTORY_MODULE, expanded: false },
		[resourceTableNode({
			schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: ProductTemplateCommands.SEARCH,
			filterGraph: { if: ['brand_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'product_templates',
		})],
	)];
}
