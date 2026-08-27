import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxProductClassificationCommands } from '../features/taxProductClassification/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Tax product classifications: what a product is for tax purposes.
 *
 * Rules test the classification rather than the product itself, which is what keeps a tax rule from
 * having to know the product catalogue (BR-TAX-ESS-025).
 */
export function buildTaxProductClassificationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'tax_classifications',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxProductClassificationCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxProductClassificationCommands.DELETE,
		archiveCommand: TaxProductClassificationCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxProductClassificationCommands.UPDATE,
	});
}

function buildDetailProps() {
	return resourceDetailProps({
		schemaName: c.TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxProductClassificationCommands.GET_BY_ID,
			create: TaxProductClassificationCommands.CREATE,
			update: TaxProductClassificationCommands.UPDATE,
			delete: TaxProductClassificationCommands.DELETE,
			archive: TaxProductClassificationCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildFieldsSection()],
		childrenNodes: [buildFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['code', 'name', 'jurisdiction_id', 'external_code', 'description', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['is_archived', 'created_at', 'updated_at'],
			}),
		],
	);
}
