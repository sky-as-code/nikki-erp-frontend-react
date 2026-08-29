import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxCommands } from '../features/tax/commands';
import { TaxDefinitionVersionCommands } from '../features/taxDefinitionVersion/commands';
import { TaxRateVersionCommands } from '../features/taxRateVersion/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Taxes: the stable business identity quoted on an invoice and in law.
 *
 * The record itself carries no rate and no effective period — those live on its versions, which is
 * what lets a rate change without the tax that a three-year-old invoice references becoming a
 * different tax. The versions are shown here as related sections precisely because a tax is
 * meaningless without them, but they are edited on their own pages where their lifecycle actions
 * live.
 */
export function buildTaxPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'taxes',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxCommands.DELETE,
		archiveCommand: TaxCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxCommands.UPDATE,
		fieldRenderers: {
			// Withholding is grey rather than coloured on purpose: the kind is seeded for reporting,
			// but BR-TAX-ESS-SUP-030 withholds the capability to calculate it until a requirement
			// defines its base and sign, so it must not look like the others.
			tax_kind: {
				renderer: 'badge',
				colorMap: {
					vat: 'blue',
					gst: 'cyan',
					sales_tax: 'teal',
					excise: 'orange',
					environmental: 'green',
					withholding: 'gray',
					other: 'gray',
				},
				prefix: 'tax_kind.',
			},
		},
	});
}

function buildDetailProps() {
	return resourceDetailProps({
		schemaName: c.TAX_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxCommands.GET_BY_ID,
			create: TaxCommands.CREATE,
			update: TaxCommands.UPDATE,
			delete: TaxCommands.DELETE,
			archive: TaxCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildFieldsSection()],
		childrenNodes: [
			buildFieldsSection(),
			buildDefinitionVersionsSection(),
			buildRateVersionsSection(),
		],
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
					fields: ['code', 'name', 'tax_kind', 'invoice_label', 'description', 'org_id'],
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

/**
 * The tax's definition versions — everything that decides determination or calculation, per period.
 *
 * Expanded by default because a tax with no published definition on a date cannot be calculated at
 * all, so this is the first thing an administrator needs to see.
 */
function buildDefinitionVersionsSection(): ComponentNode {
	return collapsibleSectionNode(
		{
			header: 'accounting_tax_definition_version.label',
			translationNs: c.ACCOUNTING_MODULE,
			expanded: true,
		},
		[
			resourceTableNode({
				schemaName: c.TAX_DEFINITION_VERSION_SCHEMA_NAME,
				translationNs: c.ACCOUNTING_MODULE,
				searchCommand: TaxDefinitionVersionCommands.SEARCH,
				// '${id}' is a literal placeholder the engine resolves from the route param, not a
				// JS template literal — it has to stay inside single quotes.
				filterGraph: { if: ['tax_id', '=', '${id}'] },
				fields: ['version_no', 'calculation_type', 'tax_treatment', 'lifecycle_status',
					'effective_from', 'effective_to'],
				fieldRenderers: {
					calculation_type: { renderer: 'translated', prefix: 'calculation_type.' },
					tax_treatment: { renderer: 'translated', prefix: 'tax_treatment.' },
					lifecycle_status: { renderer: 'translated', prefix: 'lifecycle_status.' },
				},
			}),
		],
	);
}

/** The tax's rate versions, so the rate in force on a date is visible from the tax itself. */
function buildRateVersionsSection(): ComponentNode {
	return collapsibleSectionNode(
		{
			header: 'accounting_tax_rate_version.label',
			translationNs: c.ACCOUNTING_MODULE,
			expanded: true,
		},
		[
			resourceTableNode({
				schemaName: c.TAX_RATE_VERSION_SCHEMA_NAME,
				translationNs: c.ACCOUNTING_MODULE,
				searchCommand: TaxRateVersionCommands.SEARCH,
				filterGraph: { if: ['tax_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'tax_rates',
				fields: ['version_no', 'rate', 'fixed_amount', 'currency_code', 'lifecycle_status',
					'effective_from', 'effective_to'],
				fieldRenderers: {
					lifecycle_status: { renderer: 'translated', prefix: 'lifecycle_status.' },
				},
			}),
		],
	);
}
