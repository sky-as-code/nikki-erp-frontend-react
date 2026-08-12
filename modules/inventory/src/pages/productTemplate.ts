import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceListProps, resourceSplitViewProps,
	resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductPriceCommands } from '../features/productPrice/commands';
import { ProductTemplateCommands } from '../features/productTemplate/commands';
import { ProductTemplateAttributeCommands } from '../features/productTemplateAttribute/commands';
import { ProductVariantCommands } from '../features/productVariant/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildProductTemplatePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductTemplateListProps(),
		secondary: buildProductTemplateDetailProps(),
	});

	return [definePage({
		routePath: 'product_templates',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductTemplateListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductTemplateCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductTemplateCommands.DELETE,
		// BR-PROD-TPL-005: a template that owns variants is archived, never deleted, so that
		// transactions referencing those variants keep their meaning.
		archiveCommand: ProductTemplateCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductTemplateCommands.UPDATE,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', active: 'green', discontinued: 'orange' },
				prefix: 'template_status.',
			},
		},
	});
}

function buildProductTemplateDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'short_name' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductTemplateCommands.GET_BY_ID,
			create: ProductTemplateCommands.CREATE,
			update: ProductTemplateCommands.UPDATE,
			delete: ProductTemplateCommands.DELETE,
			archive: ProductTemplateCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['name', 'short_name', 'status', 'org_id'],
		}, {
			header: 'form.identification',
			fields: ['product_type_id', 'category_id', 'brand_id'],
		}, {
			// sale_ok and purchase_ok decide which business processes may reference the product,
			// which is what makes them belong beside their descriptions rather than in general
			// information. See BR §2.4.
			header: 'form.sales',
			fields: ['sale_ok', 'sales_description'],
		}, {
			header: 'form.purchasing',
			fields: ['purchase_ok', 'purchase_description'],
		}, {
			// Defaults a variant inherits when it sets no value of its own. See BR §6.4.
			header: 'form.dimensions',
			fields: ['default_weight', 'default_length', 'default_width', 'default_height'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
		childrenNodes: buildTemplateSections(),
	});
}

/**
 * The template's attribute configuration and the variants it produces.
 *
 * Both are filtered by the current record's id: `${id}` is replaced with the route param at
 * render time. They render only in update mode, since during create there is no id to filter by.
 */
function buildTemplateSections(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'product_template_sections_attributes', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductTemplateAttributeCommands.SEARCH,
				filterGraph: { if: ['product_template_id', '=', '${id}'] },
				linkField: 'id',
			})],
		),
		collapsibleSectionNode(
			{ header: 'product_template_sections_variants', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductVariantCommands.SEARCH,
				filterGraph: { if: ['product_template_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'product_variants',
			})],
		),
		collapsibleSectionNode(
			{ header: 'product_template_sections_prices', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.PRODUCT_PRICE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: ProductPriceCommands.SEARCH,
				// Only the template's own rules. A variant's price rule belongs to that variant's
				// page, since it exists precisely to differ from the line's base price.
				filterGraph: { if: ['product_template_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'product_prices',
			})],
		),
	];
}
