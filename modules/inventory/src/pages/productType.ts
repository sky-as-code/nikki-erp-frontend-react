import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductTypeCommands } from '../features/productType/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductTypePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductTypeListProps(),
		secondary: buildProductTypeDetailProps(),
	});

	return [definePage({
		routePath: 'product_types',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductTypeListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_TYPE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductTypeCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductTypeCommands.DELETE,
		archiveCommand: ProductTypeCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductTypeCommands.UPDATE,
	});
}

function buildProductTypeDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_TYPE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductTypeCommands.GET_BY_ID,
			create: ProductTypeCommands.CREATE,
			update: ProductTypeCommands.UPDATE,
			delete: ProductTypeCommands.DELETE,
			archive: ProductTypeCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildProductTypeFieldsSection()],
		childrenNodes: [buildProductTypeFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductTypeFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['name', 'code', 'description'],
			}),
			resourceFormColumnNode({
				// Which business processes a product of this type may take part in. See BR Â§3.
				header: 'form.identification',
				fields: ['supports_stock', 'supports_sale', 'supports_purchase', 'supports_manufacturing'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}
