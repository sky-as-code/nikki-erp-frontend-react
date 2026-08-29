import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxGroupCommands } from '../features/taxGroup/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Tax groups: how taxes are grouped for display and reporting.
 *
 * A group is never a calculation formula. Two taxes in one group are still computed separately —
 * the group decides how an invoice presents them, nothing more.
 */
export function buildTaxGroupPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'tax_groups',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_GROUP_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxGroupCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxGroupCommands.DELETE,
		archiveCommand: TaxGroupCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxGroupCommands.UPDATE,
	});
}

function buildDetailProps() {
	return resourceDetailProps({
		schemaName: c.TAX_GROUP_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxGroupCommands.GET_BY_ID,
			create: TaxGroupCommands.CREATE,
			update: TaxGroupCommands.UPDATE,
			delete: TaxGroupCommands.DELETE,
			archive: TaxGroupCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildFieldsSection()],
		childrenNodes: [buildFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.ACCOUNTING_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					fields: ['code', 'name', 'display_name', 'description', 'org_id'],
				}),
			},
			{
				key: 'audit',
				header: 'form.audit',
				content: resourceFormColumnNode({
					header: 'form.audit',
					fields: ['display_sequence', 'is_archived', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}
