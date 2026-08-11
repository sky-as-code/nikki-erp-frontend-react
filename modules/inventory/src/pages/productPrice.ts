import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceDetailProps, resourceListProps, resourceSplitViewProps } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductPriceCommands } from '../features/productPrice/commands';


/**
 * Price rules, as a page of their own. See BR §6.12.
 *
 * Most price work happens from the product it belongs to — the template detail page carries a
 * Prices section — but a rule targeting a variant belongs to no single template page, and pricing
 * is reviewed across products as often as within one, so the list exists in its own right.
 */
export function buildProductPricePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductPriceListProps(),
		secondary: buildProductPriceDetailProps(),
	});

	return [definePage({
		routePath: 'product-prices',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductPriceListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_PRICE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductPriceCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductPriceCommands.DELETE,
		archiveCommand: ProductPriceCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductPriceCommands.UPDATE,
		fieldRenderers: {
			// Only an approved rule prices a product, so the state has to be readable at a glance:
			// a draft sitting unnoticed means the product is still on its old price.
			status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', approved: 'green', expired: 'orange' },
				prefix: 'price_status.',
			},
		},
	});
}

function buildProductPriceDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_PRICE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'price' },
		titleLvl2: { schemaField: 'status' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductPriceCommands.GET_BY_ID,
			create: ProductPriceCommands.CREATE,
			update: ProductPriceCommands.UPDATE,
			delete: ProductPriceCommands.DELETE,
			archive: ProductPriceCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			// Both target fields are offered together because exactly one must be filled, and the
			// backend rejects the row otherwise. Putting them side by side makes that an evident
			// choice rather than a validation surprise.
			header: 'form.generalInformation',
			fields: ['product_template_id', 'product_variant_id', 'price', 'status', 'org_id'],
		}, {
			header: 'form.validity',
			fields: ['effective_from', 'effective_to'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
	});
}
