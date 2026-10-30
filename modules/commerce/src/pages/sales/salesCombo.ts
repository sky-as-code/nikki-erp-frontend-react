import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesComboCommands } from '../../features/sales/salesCombo/commands';
import { SalesComboComponentCommands } from '../../features/sales/salesComboComponent/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * `combo_price` is independent and never derived from the components. Component allocation is an
 * output, computed to spread that price for tax and returns, never an input to it.
 */
export function buildSalesComboPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesComboListProps(),
		secondary: buildSalesComboDetailProps(),
	});

	return [definePage({
		routePath: 'sales_combo',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesComboListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_COMBO_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesComboCommands.SEARCH,
		updateCommand: SalesComboCommands.UPDATE,
		createEnabled: true,
		archiveCommand: SalesComboCommands.SET_IS_ARCHIVED,
	});
}

function buildSalesComboDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_COMBO_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesComboCommands.GET_BY_ID,
			create: SalesComboCommands.CREATE,
			update: SalesComboCommands.UPDATE,
			archive: SalesComboCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildSalesComboFieldsSection()],
		childrenNodes: [buildSalesComboFieldsSection()],
		relatedResources: buildSalesComboComponentsResources(),
	});
}

function buildSalesComboFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.combo',
			fields: ['code', 'name', 'description', 'combo_price'],
		}),
		resourceFormColumnNode({
			header: 'form.policy',
			// Whether the bundle may be broken up on return, or must come back whole.
			fields: ['return_policy'],
		}),
		resourceFormColumnNode({
			header: 'form.validity',
			fields: ['valid_from', 'valid_until'],
		}),
		resourceFormColumnNode({
			header: 'form.other_information',
			fields: ['is_archived'],
		}),
	]);
}

/** `selection_group` is how a "choose one of these" bundle is expressed. */
function buildSalesComboComponentsResources() {
	return [
		{
			label: 'sales_combo_sections_components',
			schemaName: c.SALES_COMBO_COMPONENT_SCHEMA_NAME,
			translationNs: c.SALES_MODULE,
			searchCommand: SalesComboComponentCommands.SEARCH,
			initialGraph: { if: ['sales_combo_id', '=', '${id}'] },
			fields: ['product_variant_id', 'quantity', 'uom_id', 'is_required',
				'selection_group'],
		},
	];
}
