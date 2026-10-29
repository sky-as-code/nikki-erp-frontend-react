import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { ProductAttributeValueCommands } from '../../features/inventory/productAttributeValue/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductAttributeValuePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductAttributeValueListProps(),
		secondary: buildProductAttributeValueDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_product_attribute_value',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductAttributeValueListProps() {
	return resourceListV2Props({
		schemaName: c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductAttributeValueCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductAttributeValueCommands.DELETE,
		archiveCommand: ProductAttributeValueCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductAttributeValueCommands.UPDATE,
		updateCommand: ProductAttributeValueCommands.UPDATE,
	});
}

function buildProductAttributeValueDetailProps() {
	return resourceDetailV2Props({
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
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['attribute_id', 'name', 'code', 'sequence', 'org_id'],
		}),
		resourceFormColumnNode({
			// price_extra is added to the template's price when this value is chosen, which is
			// why it sits with the sales fields rather than with general information.
			header: 'form.sales',
			fields: ['price_extra'],
		}),
	]);
}
