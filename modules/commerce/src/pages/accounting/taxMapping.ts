// Proxy copy of `nikkierp/modules/accounting/src/pages/taxMapping.ts`; keep in step. Commerce registers nothing for these schemas:
// the accounting micro-app stays in the host and is lazy-loaded to serve them.
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/accounting';
import { TaxMappingCommands } from '../../features/accounting/commands';
import { TaxMappingLineCommands } from '../../features/accounting/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: { draft: 'gray', published: 'green', withdrawn: 'orange' },
	prefix: 'lifecycle_status.',
} as const;

/**
 * Tax mappings: a context-specific substitution of one tax for another.
 *
 * A mapping is not a second determination engine (TAX-SUP-INV-08). It runs once, after the rules
 * have settled the tax set, and only when a rule result asks for it — which is why at most one may
 * apply to a transaction. Two matching mappings make the outcome unresolved rather than letting
 * the engine pick.
 */
export function buildTaxMappingPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildListProps(),
		secondary: buildDetailProps(),
	});

	return [definePage({
		routePath: 'accounting_tax_mapping',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildListProps() {
	return resourceListV2Props({
		schemaName: c.TAX_MAPPING_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		linkField: 'id',
		searchCommand: TaxMappingCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TaxMappingCommands.DELETE,
		archiveCommand: TaxMappingCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TaxMappingCommands.UPDATE,
		fieldRenderers: {
			lifecycle_status: STATUS_BADGE,
		},
	});
}

function buildDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.TAX_MAPPING_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		...statusStripProps({
			statuses: Object.keys(STATUS_BADGE.colorMap),
			prefix: STATUS_BADGE.prefix,
		}, 'lifecycle_status'),
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: TaxMappingCommands.GET_BY_ID,
			create: TaxMappingCommands.CREATE,
			update: TaxMappingCommands.UPDATE,
			delete: TaxMappingCommands.DELETE,
			archive: TaxMappingCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildLifecycleActions(),
		createNodes: [buildFieldsSection()],
		childrenNodes: [buildFieldsSection()],
		relatedResources: [buildMappingLinesResource()],
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
			fields: ['code', 'name', 'priority'],
		}),
		resourceFormColumnNode({
			header: 'form.effectivePeriod',
			fields: ['effective_from', 'effective_to'],
		}),
		resourceFormColumnNode({
			header: 'form.lifecycle',
			fields: ['version_no', 'supersedes_mapping_id'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['is_archived'],
		}),
	]);
}

/**
 * The substitutions themselves: source tax in, target tax out.
 *
 * A mapping leaves any tax it does not name alone, so the lines are the whole of what it does.
 */
function buildMappingLinesResource() {
	return {
		label: 'accounting_tax_mapping_line.label',
		schemaName: c.TAX_MAPPING_LINE_SCHEMA_NAME,
		translationNs: c.ACCOUNTING_MODULE,
		searchCommand: TaxMappingLineCommands.SEARCH,
		initialGraph: { if: ['tax_mapping_id', '=', '${id}'] },
		fields: ['sequence', 'source_tax_id', 'target_tax_id'],
	};
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
			command: TaxMappingCommands.UPDATE,
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
			command: TaxMappingCommands.UPDATE,
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
