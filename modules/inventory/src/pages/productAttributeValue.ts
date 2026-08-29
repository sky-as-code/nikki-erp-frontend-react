import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductAttributeValueCommands } from '../features/productAttributeValue/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductAttributeValuePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductAttributeValueListProps(),
		secondary: buildProductAttributeValueDetailProps(),
	});

	return [definePage({
		routePath: 'attribute_values',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductAttributeValueListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductAttributeValueCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductAttributeValueCommands.DELETE,
		archiveCommand: ProductAttributeValueCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductAttributeValueCommands.UPDATE,
	});
}

function buildProductAttributeValueDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductAttributeValueCommands.GET_BY_ID,
			create: ProductAttributeValueCommands.CREATE,
			update: ProductAttributeValueCommands.UPDATE,
			delete: ProductAttributeValueCommands.DELETE,
			archive: ProductAttributeValueCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildProductAttributeValueFieldsSection()],
		childrenNodes: [buildProductAttributeValueFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductAttributeValueFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					fields: ['attribute_id', 'name', 'code', 'sequence', 'org_id'],
				}),
			},
			{
				key: 'sales',
				header: 'form.sales',
				content: resourceFormColumnNode({
					// price_extra is added to the template's price when this value is chosen, which is
					// why it sits with the sales fields rather than with general information.
					header: 'form.sales',
					fields: ['price_extra'],
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
