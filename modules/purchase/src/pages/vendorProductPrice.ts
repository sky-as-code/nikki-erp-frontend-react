import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { VendorProductPriceCommands } from '../features/vendorProductPrice/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Vendor product prices: what each supplier is currently asking for a product.
 *
 * The page exists because the answer is not one number. A vendor quotes per unit, from a quantity,
 * for a period — and often several of those at once, which is why a product's prices are a list
 * rather than a field. Somewhere to see them side by side is what makes a purchase price defensible
 * rather than typed from memory.
 *
 * It carries no lifecycle actions. A quote is master data: it is created, corrected and eventually
 * archived, and none of those is a state machine. Archiving is the standard action, and it is how a
 * withdrawn offer is retired without breaking the orders that already resolved through it.
 */
export function buildVendorProductPricePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildVendorProductPriceListProps(),
		secondary: buildVendorProductPriceDetailProps(),
	});

	return [definePage({
		routePath: 'vendor_product_prices',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildVendorProductPriceListProps() {
	return resourceListProps({
		schemaName: c.VENDOR_PRODUCT_PRICE_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		linkField: 'id',
		searchCommand: VendorProductPriceCommands.SEARCH,
		createEnabled: true,
		deleteCommand: VendorProductPriceCommands.DELETE,
		archiveCommand: VendorProductPriceCommands.SET_IS_ARCHIVED,
		updateSaveCommand: VendorProductPriceCommands.UPDATE,
	});
}

function buildVendorProductPriceDetailProps() {
	return resourceDetailProps({
		schemaName: c.VENDOR_PRODUCT_PRICE_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		// The price is what identifies the row to somebody scanning a list of them; the vendor says
		// whose it is. Neither alone is enough, which is why both lines are used.
		titleLvl1: { schemaField: 'unit_price' },
		titleLvl2: { schemaField: 'vendor_id' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: VendorProductPriceCommands.GET_BY_ID,
			create: VendorProductPriceCommands.CREATE,
			update: VendorProductPriceCommands.UPDATE,
			delete: VendorProductPriceCommands.DELETE,
			archive: VendorProductPriceCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildVendorProductPriceFieldsSection()],
		childrenNodes: [buildVendorProductPriceFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildVendorProductPriceFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.PURCHASE_MODULE,
		tabs: [
			{
				key: 'other',
				header: 'form.other_information',
				content: resourceFormColumnNode({
					// Who is offering what. product_variant_id is deliberately here beside the template
					// rather than in its own block: leaving it empty is a meaningful choice — the quote then
					// covers every variant of the template — and separating the two would hide that they are
					// one decision.
					header: 'form.other_information',
					fields: ['vendor_id', 'product_template_id', 'product_variant_id', 'org_id'],
				}),
			},
			{
				key: 'pricing',
				header: 'form.pricing',
				content: resourceFormColumnNode({
					// The four fields that make a price a price. A number without its unit, its currency and
					// the quantity it applies from is not a quote — it is a number.
					header: 'form.pricing',
					fields: ['unit_price', 'currency_id', 'purchase_uom_id', 'min_quantity'],
				}),
			},
			{
				key: 'validity',
				header: 'form.validity',
				content: resourceFormColumnNode({
					// An absent bound is open-ended, not closed: a quote with no valid_to is a standing
					// offer. sequence breaks ties between rows that are otherwise equally applicable.
					header: 'form.validity',
					fields: ['valid_from', 'valid_to', 'lead_time_days', 'sequence'],
				}),
			},
			{
				key: 'vendor_reference',
				header: 'form.vendor_reference',
				content: resourceFormColumnNode({
					// What the vendor calls this product. Kept so their paperwork can be reconciled against
					// ours without anybody having to remember the mapping.
					header: 'form.vendor_reference',
					fields: ['vendor_product_code', 'vendor_product_name'],
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
