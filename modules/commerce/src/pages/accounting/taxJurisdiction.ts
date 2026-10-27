// Proxy copy of `nikkierp/modules/accounting/src/pages/taxJurisdiction.ts`; keep in step. Commerce registers nothing for these schemas:
// the accounting micro-app stays in the host and is lazy-loaded to serve them.
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/accounting';
import { TaxJurisdictionCommands } from '../../features/accounting/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Tax jurisdictions: the territories a taxing authority levies tax in.
 *
 * A jurisdiction is a tree — a city sits inside a province sits inside a country — and `parent_id`
 * is what expresses that. The backend refuses a cycle; nothing here needs to.
 */
export function buildTaxJurisdictionPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'accounting_tax_jurisdiction',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListV2Props({
		schemaName: c.TAX_JURISDICTION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxJurisdictionCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxJurisdictionCommands.DELETE,
		archiveCommand: TaxJurisdictionCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxJurisdictionCommands.UPDATE,
		updateCommand: TaxJurisdictionCommands.UPDATE,
		fieldRenderers: {
			// The colours run cool-to-warm with descending scope, so a reader can see the depth of
			// a jurisdiction without reading the label.
			level: {
				renderer: 'badge',
				colorMap: {
					country: 'blue',
					state: 'cyan',
					province: 'teal',
					county: 'green',
					city: 'lime',
					special: 'orange',
				},
				prefix: 'level.',
			},
		},
	});
}

function buildDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.TAX_JURISDICTION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxJurisdictionCommands.GET_BY_ID,
			create: TaxJurisdictionCommands.CREATE,
			update: TaxJurisdictionCommands.UPDATE,
			delete: TaxJurisdictionCommands.DELETE,
			archive: TaxJurisdictionCommands.SET_IS_ARCHIVED,
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
			fields: ['code', 'name', 'country_code', 'level', 'parent_id', 'authority_name',
				'org_id'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['is_archived', 'created_at', 'created_by', 'updated_at'],
		}),
	]);
}
