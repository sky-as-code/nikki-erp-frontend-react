import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceDetailProps, resourceListProps, resourceSplitViewProps } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ProductVariantCommands } from '../features/productVariant/commands';


export function buildProductVariantPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildProductVariantListProps(),
		secondary: buildProductVariantDetailProps(),
	});

	return [definePage({
		routePath: 'product-variants',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildProductVariantListProps() {
	return resourceListProps({
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: ProductVariantCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ProductVariantCommands.DELETE,
		archiveCommand: ProductVariantCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ProductVariantCommands.UPDATE,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: { active: 'green', discontinued: 'orange' },
				prefix: 'variant_status.',
			},
			archive_source: {
				renderer: 'badge',
				colorMap: { user: 'red', template_cascade: 'gray', system_sync: 'blue' },
				prefix: 'archive_source.',
			},
		},
	});
}

function buildProductVariantDetailProps() {
	return resourceDetailProps({
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'sku' },
		titleLvl2: { schemaField: 'combination_key' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: ProductVariantCommands.GET_BY_ID,
			create: ProductVariantCommands.CREATE,
			update: ProductVariantCommands.UPDATE,
			delete: ProductVariantCommands.DELETE,
			archive: ProductVariantCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['product_template_id', 'status', 'org_id'],
		}, {
			header: 'form.identification',
			fields: ['sku', 'primary_barcode', 'combination_key'],
		}, {
			// Left empty, each of these inherits the template's default. Null means "inherited",
			// never zero. See BR §6.4.
			header: 'form.dimensions',
			fields: ['weight', 'length', 'width', 'height'],
		}, {
			// archive_source is what lets unarchiving a template restore only the variants it
			// took down, so it is shown rather than hidden. See BR §8.9.
			header: 'form.audit',
			fields: ['is_materialized', 'archive_source', 'created_at', 'updated_at'],
		}],
	});
}
