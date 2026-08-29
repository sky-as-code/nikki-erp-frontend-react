import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesComboCommands } from '../features/salesCombo/commands';
import { SalesComboComponentCommands } from '../features/salesComboComponent/commands';

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
		routePath: 'sales_combos',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesComboListProps() {
	return resourceListProps({
		schemaName: c.SALES_COMBO_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesComboCommands.SEARCH,
		createEnabled: true,
		archiveCommand: SalesComboCommands.SET_IS_ARCHIVED,
	});
}

function buildSalesComboDetailProps() {
	return resourceDetailProps({
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
		childrenNodes: [buildSalesComboFieldsSection(), ...buildSalesComboComponentsSection()],
	});
}

function buildSalesComboFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.SALES_MODULE,
		tabs: [
			{
				key: 'combo',
				header: 'form.combo',
				content: resourceFormColumnNode({
					header: 'form.combo',
					fields: ['code', 'name', 'description', 'combo_price'],
				}),
			},
			{
				key: 'policy',
				header: 'form.policy',
				content: resourceFormColumnNode({
					header: 'form.policy',
					// Whether the bundle may be broken up on return, or must come back whole.
					fields: ['return_policy'],
				}),
			},
			{
				key: 'validity',
				header: 'form.validity',
				content: resourceFormColumnNode({
					header: 'form.validity',
					fields: ['valid_from', 'valid_until'],
				}),
			},
			{
				key: 'other',
				header: 'form.other_information',
				content: resourceFormColumnNode({
					header: 'form.other_information',
					fields: ['is_archived', 'org_id', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}

/** `selection_group` is how a "choose one of these" bundle is expressed. */
function buildSalesComboComponentsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_combo_sections_components',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_COMBO_COMPONENT_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesComboComponentCommands.SEARCH,
				filterGraph: { if: ['sales_combo_id', '=', '${id}'] },
				fields: ['product_variant_id', 'quantity', 'uom_id', 'is_required',
					'selection_group'],
			})],
		),
	];
}
