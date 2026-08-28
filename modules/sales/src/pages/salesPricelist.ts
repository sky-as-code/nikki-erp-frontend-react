import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesPricelistCommands } from '../features/salesPricelist/commands';
import { SalesPricelistItemCommands } from '../features/salesPricelistItem/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Specificity beats priority: a point-scoped list wins over a channel-scoped one whatever their
 * priorities say. Priority only breaks ties within a scope.
 */
export function buildSalesPricelistPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPricelistListProps(),
		secondary: buildSalesPricelistDetailProps(),
	});

	return [definePage({
		routePath: 'sales_pricelists',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPricelistListProps() {
	return resourceListProps({
		schemaName: c.SALES_PRICELIST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPricelistCommands.SEARCH,
		createEnabled: true,
		archiveCommand: SalesPricelistCommands.SET_IS_ARCHIVED,
	});
}

function buildSalesPricelistDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_PRICELIST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesPricelistCommands.GET_BY_ID,
			create: SalesPricelistCommands.CREATE,
			update: SalesPricelistCommands.UPDATE,
			archive: SalesPricelistCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildSalesPricelistActions(),
		createNodes: [buildSalesPricelistFieldsSection()],
		childrenNodes: [buildSalesPricelistFieldsSection(), ...buildSalesPricelistItemsSection()],
	});
}

function buildSalesPricelistFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.pricelist',
				fields: ['code', 'name', 'description', 'currency_id', 'is_default'],
			}),
			resourceFormColumnNode({
				header: 'form.scope',
				// Both nullable; a list scoped to neither applies everywhere.
				fields: ['sales_channel_id', 'sales_point_id', 'priority'],
			}),
			resourceFormColumnNode({
				header: 'form.validity',
				fields: ['valid_from', 'valid_until'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				fields: ['is_archived', 'org_id', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * An action rather than a PATCH on `is_default`, because it is a move and not a set: the flag has to
 * leave whichever list currently holds it, and the resolver cannot choose between two defaults.
 */
function buildSalesPricelistActions() {
	return {
		set_default: {
			label: 'actions.set_default',
			command: SalesPricelistCommands.SET_DEFAULT,
			condition: {
				field: 'is_default',
				operator: 'not_equal' as const,
				value: true,
			},
		},
	};
}

/**
 * Items use `valid_to`, not the parent's `valid_until` — the two schemas genuinely disagree, and
 * naming the wrong one yields an empty column rather than an error.
 */
function buildSalesPricelistItemsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_pricelist_sections_items',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_PRICELIST_ITEM_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesPricelistItemCommands.SEARCH,
				filterGraph: { if: ['sales_pricelist_id', '=', '${id}'] },
				fields: ['sequence', 'applies_to', 'product_variant_id', 'min_quantity',
					'calculation_method', 'price', 'discount_percent', 'valid_from', 'valid_to'],
				fieldRenderers: {
					applies_to: {
						renderer: 'badge',
						colorMap: {
							ALL_PRODUCTS: 'gray',
							PRODUCT_CATEGORY: 'blue',
							PRODUCT_TEMPLATE: 'indigo',
							PRODUCT_VARIANT: 'grape',
						},
						prefix: 'applies_to.',
					},
					calculation_method: {
						renderer: 'badge',
						colorMap: { FIXED_PRICE: 'green', DISCOUNT: 'orange', FORMULA: 'violet' },
						prefix: 'calculation_method.',
					},
				},
			})],
		),
	];
}
