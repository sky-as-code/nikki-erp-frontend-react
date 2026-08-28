import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import {
	ProductTemplateAttributeValueCommands,
} from '../features/productTemplateAttributeValue/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Which values a template offers for one of its attributes, and what each adds to its price.
 *
 * The junction had no page until `sales_price_extra` moved onto it. It was reachable only as a
 * relation select, which was enough while the row held nothing but a link and a sequence — but a
 * surcharge nobody can edit is a surcharge nobody can set, and the field would have been dead on
 * arrival.
 *
 * It is filtered by `template_attribute_id` rather than by the template, because that is the column
 * the row actually carries: a value belongs to one attribute OF one template, and the template is
 * two hops away. Hence the route being reached from the attributes table on the template page
 * rather than being a menu entry of its own.
 */
export function buildProductTemplateAttributeValuePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'template_attribute_values',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductTemplateAttributeValueCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductTemplateAttributeValueCommands.DELETE,
		updateSaveCommand: ProductTemplateAttributeValueCommands.UPDATE,
	});
}

function buildDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'attribute_value_id' },
		titleLvl2: { schemaField: 'sales_price_extra' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductTemplateAttributeValueCommands.GET_BY_ID,
			create: ProductTemplateAttributeValueCommands.CREATE,
			update: ProductTemplateAttributeValueCommands.UPDATE,
			delete: ProductTemplateAttributeValueCommands.DELETE,
		},
		createNodes: [buildFieldsSection()],
		childrenNodes: [buildFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildFieldsSection(): ComponentNode {
	return collapsibleSectionNode({ layout: 'formBlocks' }, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['template_attribute_id', 'attribute_value_id', 'sequence'],
		}),
		resourceFormColumnNode({
			// Signed, and that is the point: XL may add 20,000 while a plain colour subtracts. It is
			// a SALES figure only — it must never reach a cost calculation, because a colour that
			// sells for more does not thereby cost more.
			header: 'form.pricing',
			fields: ['sales_price_extra'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}),
	]);
}
