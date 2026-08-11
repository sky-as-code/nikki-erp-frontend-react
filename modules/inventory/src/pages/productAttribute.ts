import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceListProps, resourceSplitViewProps,
	resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductAttributeCommands } from '../features/productAttribute/commands';
import { ProductAttributeValueCommands } from '../features/productAttributeValue/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductAttributePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductAttributeListProps(),
		secondary: buildProductAttributeDetailProps(),
	});

	return [definePage({
		routePath: 'attributes',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductAttributeListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_ATTRIBUTE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductAttributeCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductAttributeCommands.DELETE,
		archiveCommand: ProductAttributeCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductAttributeCommands.UPDATE,
		fieldRenderers: {
			variant_creation_mode: {
				renderer: 'badge',
				colorMap: { instant: 'green', dynamic: 'blue', never: 'gray' },
				prefix: 'variant_creation_mode.',
			},
			data_type: {
				renderer: 'badge',
				colorMap: {
					option: 'blue', text: 'gray', number: 'teal', date: 'grape', boolean: 'orange',
				},
				prefix: 'attribute_data_type.',
			},
		},
	});
}

function buildProductAttributeDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_ATTRIBUTE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductAttributeCommands.GET_BY_ID,
			create: ProductAttributeCommands.CREATE,
			update: ProductAttributeCommands.UPDATE,
			delete: ProductAttributeCommands.DELETE,
			archive: ProductAttributeCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['name', 'code', 'sequence', 'org_id'],
		}, {
			// variant_creation_mode decides whether this attribute's values produce variants at
			// all: NEVER keeps it out of the combination key entirely. See BR §4.7 and §6.5.3.
			header: 'form.attributes',
			fields: ['data_type', 'variant_creation_mode', 'display_type'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
		childrenNodes: buildAttributeValuesSection(),
	});
}

/** The values this attribute allows. */
function buildAttributeValuesSection(): ComponentNode[] {
	return [collapsibleSectionNode(
		{ header: 'inventory_product_attribute_value.label', translationNs: c.INVENTORY_MODULE, expanded: false },
		[resourceTableNode({
			schemaName: c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: ProductAttributeValueCommands.SEARCH,
			filterGraph: { if: ['attribute_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'attribute-values',
		})],
	)];
}
