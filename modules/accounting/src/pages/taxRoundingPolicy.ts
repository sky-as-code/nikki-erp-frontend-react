import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxRoundingPolicyCommands } from '../features/taxRoundingPolicy/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Tax rounding policies: how a computed amount is rounded, and whether per line or per document.
 *
 * The scope is the consequential field. A document-scoped policy cannot be applied one line at a
 * time — rounding each line and summing gives a different number, and not the one the law asks for
 * (BR-TAX-ESS-022).
 */
export function buildTaxRoundingPolicyPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'tax_rounding_policies',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_ROUNDING_POLICY_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxRoundingPolicyCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxRoundingPolicyCommands.DELETE,
		archiveCommand: TaxRoundingPolicyCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxRoundingPolicyCommands.UPDATE,
		fieldRenderers: {
			// Draft is invisible to the engine, published is what prices a transaction, withdrawn is
			// retired but still readable. Three states with three consequences, so three colours.
			lifecycle_status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', published: 'green', withdrawn: 'orange' },
				prefix: 'lifecycle_status.',
			},
			rounding_scope: {
				renderer: 'badge',
				colorMap: { line: 'blue', document: 'violet' },
				prefix: 'rounding_scope.',
			},
		},
	});
}

function buildDetailProps() {
	return resourceDetailProps({
		schemaName: c.TAX_ROUNDING_POLICY_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxRoundingPolicyCommands.GET_BY_ID,
			create: TaxRoundingPolicyCommands.CREATE,
			update: TaxRoundingPolicyCommands.UPDATE,
			delete: TaxRoundingPolicyCommands.DELETE,
			archive: TaxRoundingPolicyCommands.SET_IS_ARCHIVED,
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
				fields: ['code', 'name', 'jurisdiction_id', 'currency_code', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.calculation',
				fields: ['rounding_scope', 'rounding_method', 'rounding_increment', 'precision'],
			}),
			resourceFormColumnNode({
				header: 'form.effectivePeriod',
				fields: ['effective_from', 'effective_to'],
			}),
			resourceFormColumnNode({
				header: 'form.lifecycle',
				fields: ['lifecycle_status', 'version_no', 'supersedes_policy_id'],
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
			command: TaxRoundingPolicyCommands.UPDATE,
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
			command: TaxRoundingPolicyCommands.UPDATE,
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
