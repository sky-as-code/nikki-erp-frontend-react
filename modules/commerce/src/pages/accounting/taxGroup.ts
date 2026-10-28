// Proxy copy of `nikkierp/modules/accounting/src/pages/taxGroup.ts`; keep in step. Commerce registers nothing for these schemas:
// the accounting micro-app stays in the host and is lazy-loaded to serve them.
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/accounting';
import { TaxGroupCommands } from '../../features/accounting/commands';

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
		routePath: 'accounting_tax_group',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListV2Props({
		schemaName: c.TAX_GROUP_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxGroupCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxGroupCommands.DELETE,
		archiveCommand: TaxGroupCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxGroupCommands.UPDATE,
		updateCommand: TaxGroupCommands.UPDATE,
	});
}

function buildDetailProps() {
	return resourceDetailV2Props({
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
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.ACCOUNTING_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['code', 'name', 'display_name', 'description', 'org_id'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['display_sequence', 'is_archived', 'created_at', 'updated_at'],
		}),
	]);
}
