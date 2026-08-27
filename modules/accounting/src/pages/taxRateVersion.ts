import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxRateVersionCommands } from '../features/taxRateVersion/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Tax rates: the rate or fixed amount of a tax over one effective period.
 *
 * This is the resource a rate change actually touches. A new rate is a new version with its own
 * period — never an edit to the one in force, which would silently reprice every transaction
 * already calculated under it (BR-TAX-ESS-SUP-002).
 *
 * `rate` and `fixed_amount` are decimals and stay strings the whole way through. The engine parses
 * them exactly; a JS number could not hold them.
 */
export function buildTaxRateVersionPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'tax_rates',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_RATE_VERSION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxRateVersionCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxRateVersionCommands.DELETE,
		archiveCommand: TaxRateVersionCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxRateVersionCommands.UPDATE,
		fieldRenderers: {
			lifecycle_status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', published: 'green', withdrawn: 'orange' },
				prefix: 'lifecycle_status.',
			},
		},
	});
}

function buildDetailProps() {
	return resourceDetailProps({
		schemaName: c.TAX_RATE_VERSION_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'tax_id' },
		titleLvl2: { schemaField: 'lifecycle_status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxRateVersionCommands.GET_BY_ID,
			create: TaxRateVersionCommands.CREATE,
			update: TaxRateVersionCommands.UPDATE,
			delete: TaxRateVersionCommands.DELETE,
			archive: TaxRateVersionCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildLifecycleActions(),
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
				fields: ['tax_id', 'description', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.calculation',
				// `rate` for a percentage tax, `fixed_amount` with its currency and unit for a
				// fixed one. Which pair is meaningful follows from the definition version's
				// calculation type, and the backend refuses the wrong combination.
				fields: ['rate', 'fixed_amount', 'currency_code', 'rate_uom_id'],
			}),
			resourceFormColumnNode({
				header: 'form.effectivePeriod',
				fields: ['effective_from', 'effective_to'],
			}),
			resourceFormColumnNode({
				header: 'form.lifecycle',
				fields: ['lifecycle_status', 'version_no', 'legal_reference'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['is_archived', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * The two lifecycle actions.
 *
 * Both dispatch UPDATE with the target `lifecycle_status` rather than a dedicated command, because
 * the backend has no publish or withdraw endpoint: lifecycle is a validated field transition on the
 * resource, and the engine's update action is what enforces the state machine
 * (draft -> published -> withdrawn, never backwards). A `.publish` command would 404.
 *
 * The prompt names `lifecycle_status` because a prompt may only name fields of the page's own
 * schema, and that is exactly the field being changed — so the dialog shows the user the transition
 * they are about to make rather than an empty box.
 */
function buildLifecycleActions() {
	return {
		/**
		 * Puts the configuration into effect, freezing every field that decides an amount.
		 *
		 * Offered only from draft. Publication is not reversible, which is why it is a deliberate
		 * action rather than a status a user edits in the form.
		 */
		publish: {
			label: 'actions.publish',
			command: TaxRateVersionCommands.UPDATE,
			condition: {
				field: 'lifecycle_status',
				operator: 'equal' as const,
				value: c.LIFECYCLE_DRAFT,
			},
			prompt: {
				title: 'actions.publish.title',
				fields: [{ name: 'lifecycle_status', required: true }],
			},
		},
		/**
		 * Retires the configuration from new determination, leaving it readable for audit.
		 *
		 * Offered from draft and published alike; `in` rather than two conditions, since a
		 * withdrawn configuration has nothing left to retire. Withdrawn is terminal: it can never
		 * return to draft, or the history that withdrawing it closed would reopen.
		 */
		withdraw: {
			label: 'actions.withdraw',
			command: TaxRateVersionCommands.UPDATE,
			condition: {
				field: 'lifecycle_status',
				operator: 'in' as const,
				value: [c.LIFECYCLE_DRAFT, c.LIFECYCLE_PUBLISHED],
			},
			prompt: {
				title: 'actions.withdraw.title',
				fields: [{ name: 'lifecycle_status', required: true }],
			},
		},
	};
}
