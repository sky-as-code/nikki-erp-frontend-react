import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceListV2Props } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import {
	ProductTemplateAttributeValueCommands,
} from '../features/productTemplateAttributeValue/commands';


/** The one field the junction's update accepts; the selection rides the template's own save. */
const EDITABLE_FIELDS = ['sales_price_extra'];

/**
 * The extra price of each value one template line offers, edited in the list itself: there is no
 * detail pane, because a row holds nothing else worth a form.
 *
 * The template's Attributes table opens it through "Configure" with
 * `?initialGraph={"if":["template_attribute_id","=",lineId],...}`: a value belongs to one attribute
 * OF one template, and `template_attribute_id` is the column the row carries, so that is the
 * filter. Rows unselected on the template still show, with "Selected" off: their price is kept for
 * when the value is selected again.
 *
 * Only `sales_price_extra` is edited (`editableFields`), since the backend refuses any other field
 * on this update, and the row editor locks on `update_value` of the attribute, which is what the
 * backend asserts for it. A NULL price adds nothing and shows as 0. It is a SALES figure only and must
 * never reach a cost calculation: a colour that sells for more does not thereby cost more.
 */
export function buildProductTemplateAttributeValuePages(): PageNode[] {
	const list = resourceListV2Props({
		schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: ProductTemplateAttributeValueCommands.SEARCH,
		updateCommand: ProductTemplateAttributeValueCommands.UPDATE,
		updateSaveCommand: ProductTemplateAttributeValueCommands.UPDATE,
		editableFields: EDITABLE_FIELDS,
		updateActionCode: c.PRODUCT_ATTRIBUTE_UPDATE_VALUE_ACTION,
		updateActionResource: c.PRODUCT_ATTRIBUTE_SCHEMA_NAME,
		// The order the template shows its values in; a link's own graph narrows it to one line.
		initialGraph: { order: [['sequence', 'asc']] },
		fieldRenderers: {
			sales_price_extra: { renderer: 'money', blankAsZero: true },
		},
	});

	return [definePage({
		routePath: 'inventory_product_template_attribute_value',
		template: list.template,
		props: list.props,
	})];
}
