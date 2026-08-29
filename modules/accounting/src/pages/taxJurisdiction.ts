import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxJurisdictionCommands } from '../features/taxJurisdiction/commands';

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
		routePath: 'tax_jurisdictions',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_JURISDICTION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxJurisdictionCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxJurisdictionCommands.DELETE,
		archiveCommand: TaxJurisdictionCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxJurisdictionCommands.UPDATE,
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
	return resourceDetailProps({
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
	return tabCollapsibleSectionNode({
		translationNs: c.ACCOUNTING_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					fields: ['code', 'name', 'country_code', 'level', 'parent_id', 'authority_name',
						'org_id'],
				}),
			},
			{
				key: 'audit',
				header: 'form.audit',
				content: resourceFormColumnNode({
					header: 'form.audit',
					fields: ['is_archived', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}
