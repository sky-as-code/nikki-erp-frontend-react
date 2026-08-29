import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { TaxRuleCommands } from '../features/taxRule/commands';
import { TaxRuleConditionCommands } from '../features/taxRuleCondition/commands';
import { TaxRuleResultCommands } from '../features/taxRuleResult/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Tax rules: which taxes apply to a transaction context.
 *
 * A rule is its conditions and its results — on its own it decides nothing — so both are shown
 * here rather than behind their own menu entries. Evaluation is by `priority` ascending and never
 * by how specific a rule looks: a rule with five conditions does not outrank one with two
 * (BR-TAX-ESS-SUP-010). `stop_processing` is what ends evaluation early.
 */
export function buildTaxRulePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'tax_rules',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListProps({
		schemaName: c.TAX_RULE_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxRuleCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxRuleCommands.DELETE,
		archiveCommand: TaxRuleCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxRuleCommands.UPDATE,
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
		schemaName: c.TAX_RULE_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxRuleCommands.GET_BY_ID,
			create: TaxRuleCommands.CREATE,
			update: TaxRuleCommands.UPDATE,
			delete: TaxRuleCommands.DELETE,
			archive: TaxRuleCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildLifecycleActions(),
		createNodes: [buildFieldsSection()],
		childrenNodes: [
			buildFieldsSection(),
			buildConditionsSection(),
			buildResultsSection(),
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
					fields: ['code', 'name', 'jurisdiction_id', 'org_id'],
				}),
			},
			{
				key: 'calculation',
				header: 'form.calculation',
				content: resourceFormColumnNode({
					header: 'form.calculation',
					fields: ['priority', 'stop_processing'],
				}),
			},
			{
				key: 'effective_period',
				header: 'form.effectivePeriod',
				content: resourceFormColumnNode({
					header: 'form.effectivePeriod',
					fields: ['effective_from', 'effective_to'],
				}),
			},
			{
				key: 'lifecycle',
				header: 'form.lifecycle',
				content: resourceFormColumnNode({
					header: 'form.lifecycle',
					fields: ['lifecycle_status', 'version_no', 'legal_reference', 'supersedes_rule_id'],
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
 * The rule's conditions, which are ANDed: every one must hold for the rule to fire.
 *
 * `field_key` may only name a field on the closed whitelist the backend accepts
 * (BR-TAX-ESS-SUP-022), so a condition cannot come to depend on something no one guaranteed.
 */
function buildConditionsSection(): ComponentNode {
	return collapsibleSectionNode(
		{
			header: 'accounting_tax_rule_condition.label',
			translationNs: c.ACCOUNTING_MODULE,
			expanded: true,
		},
		[
			resourceTableNode({
				schemaName: c.TAX_RULE_CONDITION_SCHEMA_NAME,
				translationNs: c.ACCOUNTING_MODULE,
				searchCommand: TaxRuleConditionCommands.SEARCH,
				filterGraph: { if: ['tax_rule_id', '=', '${id}'] },
				fields: ['sequence', 'field_key', 'operator', 'value', 'value_currency_code'],
			}),
		],
	);
}

/** What a matching rule does to the candidate tax set: add, remove, or substitute via a mapping. */
function buildResultsSection(): ComponentNode {
	return collapsibleSectionNode(
		{
			header: 'accounting_tax_rule_result.label',
			translationNs: c.ACCOUNTING_MODULE,
			expanded: true,
		},
		[
			resourceTableNode({
				schemaName: c.TAX_RULE_RESULT_SCHEMA_NAME,
				translationNs: c.ACCOUNTING_MODULE,
				searchCommand: TaxRuleResultCommands.SEARCH,
				filterGraph: { if: ['tax_rule_id', '=', '${id}'] },
				fields: ['sequence', 'action', 'tax_id', 'tax_mapping_id', 'tax_treatment'],
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
			command: TaxRuleCommands.UPDATE,
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
			command: TaxRuleCommands.UPDATE,
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
