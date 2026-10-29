// Proxy copy of `nikkierp/modules/accounting/src/pages/tax.ts`; keep in step. Commerce registers nothing for these schemas:
// the accounting micro-app stays in the host and is lazy-loaded to serve them.
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/accounting';
import { TaxCommands } from '../../features/accounting/commands';
import { TaxDefinitionVersionCommands } from '../../features/accounting/commands';
import { TaxRateVersionCommands } from '../../features/accounting/commands';

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
		routePath: 'accounting_tax',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListV2Props({
		schemaName: c.TAX_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxCommands.DELETE,
		archiveCommand: TaxCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxCommands.UPDATE,
		updateCommand: TaxCommands.UPDATE,
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
	return resourceDetailV2Props({
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
		childrenNodes: [buildFieldsSection()],
		relatedResources: [
			buildDefinitionVersionsResource(),
			buildRateVersionsResource(),
		],
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
			fields: ['code', 'name', 'tax_kind', 'invoice_label', 'description', 'org_id'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['is_archived'],
		}),
	]);
}

/**
 * The tax's definition versions — everything that decides determination or calculation, per period.
 *
 * The first related tab because a tax with no published definition on a date cannot be calculated
 * at all, so this is the first thing an administrator needs to see.
 */
function buildDefinitionVersionsResource() {
	return {
		label: 'accounting_tax_definition_version.label',
		schemaName: c.TAX_DEFINITION_VERSION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		searchCommand: TaxDefinitionVersionCommands.SEARCH,
		// '${id}' is a literal placeholder the engine resolves from the route param, not a
		// JS template literal — it has to stay inside single quotes.
		initialGraph: { if: ['tax_id', '=', '${id}'] },
		fields: ['version_no', 'calculation_type', 'tax_treatment', 'lifecycle_status',
			'effective_from', 'effective_to'],
		fieldRenderers: {
			calculation_type: { renderer: 'translated', prefix: 'calculation_type.' },
			tax_treatment: { renderer: 'translated', prefix: 'tax_treatment.' },
			lifecycle_status: { renderer: 'translated', prefix: 'lifecycle_status.' },
		},
	};
}

/** The tax's rate versions, so the rate in force on a date is visible from the tax itself. */
function buildRateVersionsResource() {
	return {
		label: 'accounting_tax_rate_version.label',
		schemaName: c.TAX_RATE_VERSION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		searchCommand: TaxRateVersionCommands.SEARCH,
		initialGraph: { if: ['tax_id', '=', '${id}'] },
		linkField: 'id',
		linkRoutePath: 'accounting_tax_rate_version',
		fields: ['version_no', 'rate', 'fixed_amount', 'currency_code', 'lifecycle_status',
			'effective_from', 'effective_to'],
		fieldRenderers: {
			lifecycle_status: { renderer: 'translated', prefix: 'lifecycle_status.' },
		},
	};
}
