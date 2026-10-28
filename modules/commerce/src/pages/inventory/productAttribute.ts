import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { ProductAttributeCommands } from '../../features/inventory/productAttribute/commands';
import { ProductAttributeValueCommands } from '../../features/inventory/productAttributeValue/commands';
import { attributeValuesNode } from '../../viewkit/inventory/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductAttributePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductAttributeListProps(),
		secondary: buildProductAttributeDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_product_attribute',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductAttributeListProps() {
	return resourceListV2Props({
		schemaName: c.PRODUCT_ATTRIBUTE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductAttributeCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductAttributeCommands.DELETE,
		archiveCommand: ProductAttributeCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductAttributeCommands.UPDATE,
		updateCommand: ProductAttributeCommands.UPDATE,
		fieldRenderers: attributeFieldRenderers(),
	});
}

/** Shared by the list and the detail's read mode, so an enum reads the same in both. */
function attributeFieldRenderers() {
	return {
		variant_creation_mode: {
			renderer: 'badge',
			colorMap: { instant: 'green', dynamic: 'blue', never: 'gray' },
			prefix: 'variant_creation_mode.',
		},
		display_type: {
			renderer: 'badge',
			colorMap: {
				pills: 'blue', radio: 'cyan', select: 'indigo', color: 'grape', multi_checkbox: 'orange',
			},
			prefix: 'display_type.',
		},
		data_type: {
			renderer: 'badge',
			colorMap: {
				option: 'blue', text: 'gray', number: 'teal', date: 'grape', boolean: 'orange',
			},
			prefix: 'attribute_data_type.',
		},
	};
}

function buildProductAttributeDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.PRODUCT_ATTRIBUTE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductAttributeCommands.GET_BY_ID,
			create: ProductAttributeCommands.CREATE,
			update: ProductAttributeCommands.UPDATE,
			delete: ProductAttributeCommands.DELETE,
			archive: ProductAttributeCommands.SET_IS_ARCHIVED,
		},
		fieldRenderers: attributeFieldRenderers(),
		createNodes: [buildProductAttributeFieldsSection(), buildAttributeValuesSection()],
		childrenNodes: [buildProductAttributeFieldsSection(), buildAttributeValuesSection()],
		relatedResources: buildAttributeValuesResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildProductAttributeFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['name', 'code', 'sequence', 'org_id'],
		}),
		resourceFormColumnNode({
			// variant_creation_mode decides whether this attribute's values produce variants at
			// all: NEVER keeps it out of the combination key entirely. See BR §4.7 and §6.5.3.
			header: 'form.attributes',
			fields: ['data_type', 'variant_creation_mode', 'display_type'],
			// Changing it would reinterpret the variants of every template applying the attribute.
			lockedFields: {
				variant_creation_mode: {
					unless: 'can_change_variant_creation', hint: 'product_attribute_modeLockedHint',
				},
			},
		}),
		resourceFormColumnNode({
			header: 'form.usage',
			fields: ['current_template_usage_count', 'historical_template_usage_count'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}),
	]);
}

/**
 * The values, edited inline and saved with the attribute in one transaction (create: add only).
 * A section of the form, not a related-resources tab: those are read-only and update-mode only.
 */
function buildAttributeValuesSection(): ComponentNode {
	return collapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		header: 'product_attribute_values_section',
	}, [attributeValuesNode()]);
}

/**
 * Read-only navigation to each value's own page, which is where a value is archived or restored:
 * archiving is its own write, so it is not drafted into the attribute's Save.
 */
function buildAttributeValuesResources() {
	return [{
		label: 'inventory_product_attribute_value.label',
		schemaName: c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: ProductAttributeValueCommands.SEARCH,
		initialGraph: { if: ['attribute_id', '=', '${id}'] },
		linkField: 'id',
		linkRoutePath: 'inventory_product_attribute_value',
	}];
}
