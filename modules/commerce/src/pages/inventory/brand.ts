import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { BrandCommands } from '../../features/inventory/brand/commands';
import { ProductTemplateCommands } from '../../features/inventory/productTemplate/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildBrandPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildBrandListProps(),
		secondary: buildBrandDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_brand',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildBrandListProps() {
	return resourceListV2Props({
		schemaName: c.BRAND_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: BrandCommands.SEARCH,
		createEnabled: true,
		deleteCommand: BrandCommands.DELETE,
		archiveCommand: BrandCommands.SET_IS_ARCHIVED,
		updateSaveCommand: BrandCommands.UPDATE,
		updateCommand: BrandCommands.UPDATE,
	});
}

function buildBrandDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.BRAND_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: BrandCommands.GET_BY_ID,
			create: BrandCommands.CREATE,
			update: BrandCommands.UPDATE,
			delete: BrandCommands.DELETE,
			archive: BrandCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildBrandFieldsSection()],
		childrenNodes: [buildBrandFieldsSection()],
		relatedResources: buildBrandProductsResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildBrandFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['name', 'code', 'description', 'org_id'],
		}),
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['website', 'logo_id', 'country_id'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['created_at', 'created_by', 'updated_at'],
		}),
	]);
}

/** The products carrying this brand. */
function buildBrandProductsResources() {
	return [{
		label: 'menu_products',
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: ProductTemplateCommands.SEARCH,
		initialGraph: { if: ['brand_id', '=', '${id}'] },
		linkField: 'id',
		linkRoutePath: 'inventory_product_template',
	}];
}
