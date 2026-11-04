import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import {
	SequenceCounterCommands, SequenceDefinitionCommands, SequenceIssuanceCommands,
} from '../features/sequence/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** int64 values arrive as decimal strings, so no digit is lost; they still read with the locale's grouping. */
const NUMBER = { renderer: 'integer' } as const;

/** The definition's enums read as their translation; the select labels its options with the same keys. */
const DEFINITION_RENDERERS = {
	configuration_scope: { renderer: 'translated', prefix: 'configuration_scope.' },
	format_owner: { renderer: 'translated', prefix: 'format_owner.' },
	algorithm: { renderer: 'translated', prefix: 'algorithm.' },
	reset_period: { renderer: 'translated', prefix: 'reset_period.' },
	increment: NUMBER,
	initial_value: NUMBER,
} as const;

/**
 * Once a definition has issued a number its rules are fixed (BR SEQ-CFG-01): every rule field locks with the
 * explanation, and only the name and description stay editable. The server refuses the change either way.
 */
function lockedOnceIssued(fields: string[]) {
	const lock = { when: { field: 'first_issued_at', operator: 'exists' as const }, hint: 'sequence.locked_hint' };
	return Object.fromEntries(fields.map(field => [field, lock]));
}

/**
 * Settings › Technical › Sequences: the definitions, and their read-only counters and issuances. Settings
 * mounts the three pages and passes its own `routes`, through which the pages link to each other.
 */
export function buildSequencePages(routes: c.SequenceRoutes = c.SEQUENCE_ROUTES): PageNode[] {
	return [
		buildSequenceDefinitionPage(routes),
		buildSequenceCounterPage(routes),
		buildSequenceIssuancePage(routes),
	];
}

function buildSequenceDefinitionPage(routes: c.SequenceRoutes): PageNode {
	const splitView = resourceSplitViewProps({
		primary: resourceListV2Props({
			schemaName: c.SEQUENCE_DEFINITION_SCHEMA_NAME,
			translationNs: c.ESSENTIAL_MODULE,
			linkField: 'id',
			searchCommand: SequenceDefinitionCommands.SEARCH,
			initialGraph: { order: [['code', 'asc']] },
			createEnabled: true,
			// No delete (BR §4.4): a definition that numbered documents stays, archived.
			archiveCommand: SequenceDefinitionCommands.SET_IS_ARCHIVED,
			fieldRenderers: DEFINITION_RENDERERS,
		}),
		secondary: buildSequenceDefinitionDetailProps(routes),
	});

	return definePage({ routePath: routes.definition, template: splitView.template, props: splitView.props });
}

function buildSequenceDefinitionDetailProps(routes: c.SequenceRoutes) {
	return resourceDetailV2Props({
		schemaName: c.SEQUENCE_DEFINITION_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SequenceDefinitionCommands.GET_BY_ID,
			create: SequenceDefinitionCommands.CREATE,
			update: SequenceDefinitionCommands.UPDATE,
			archive: SequenceDefinitionCommands.SET_IS_ARCHIVED,
		},
		contextualActions: {
			// Renders the saved rules for a sample number. It reserves nothing, so it needs only read.
			preview: {
				label: 'sequence.actions.preview',
				command: SequenceDefinitionCommands.PREVIEW,
				actionCode: 'read',
				successNotice: 'sequence.preview_result',
			},
		},
		fieldRenderers: DEFINITION_RENDERERS,
		createNodes: [buildDefinitionIdentitySection(false), buildDefinitionNumberingSection()],
		childrenNodes: [buildDefinitionIdentitySection(true), buildDefinitionNumberingSection()],
		relatedResourcesNotice: 'sequence.related_notice',
		relatedResources: [buildCountersResource(routes), buildIssuancesResource(routes, 'definition_id')],
	});
}

/** Identity and ownership. Ownership and scope never change after create; the code locks once issued. */
function buildDefinitionIdentitySection(detail: boolean): ComponentNode {
	// `scope_type` is computed by the server from the two scope fields, so create never shows it.
	const ownership = ['configuration_scope', 'owner_module', 'sub_scope', ...(detail ? ['scope_type'] : [])];
	const usage = resourceFormColumnNode({ header: 'form.usage', fields: ['first_issued_at', 'is_archived'] });
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.ESSENTIAL_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['code', 'name', 'description'],
			lockedFields: lockedOnceIssued(['code']),
		}),
		resourceFormColumnNode({ header: 'form.ownership', fields: ownership }),
		...(detail ? [usage] : []),
	]);
}

/** The rules that make a number. `algorithm_params` holds the pseudorandom key: server-only, never listed. */
function buildDefinitionNumberingSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.ESSENTIAL_MODULE,
		header: 'form.numbering',
	}, [
		resourceFormColumnNode({
			header: 'form.numberFormat',
			// The supported placeholders (BR §5.1); anything else is refused as an invalid template.
			description: 'sequence.template_legend',
			fields: ['prefix_template', 'suffix_template', 'format_owner'],
			lockedFields: lockedOnceIssued(['prefix_template', 'suffix_template', 'format_owner']),
		}),
		resourceFormColumnNode({
			header: 'form.counting',
			fields: ['algorithm', 'padding', 'initial_value', 'increment'],
			lockedFields: lockedOnceIssued(['padding', 'initial_value', 'increment']),
		}),
		resourceFormColumnNode({
			header: 'form.resetAndRetention',
			fields: ['reset_period', 'timezone', 'issuance_retention_days'],
			lockedFields: lockedOnceIssued(['reset_period', 'timezone', 'issuance_retention_days']),
		}),
	]);
}

/** Read-only (BR §8.2): no create, update, reset or delete; a counter exists once a number was issued. */
function buildSequenceCounterPage(routes: c.SequenceRoutes): PageNode {
	const splitView = resourceSplitViewProps({
		primary: resourceListV2Props({
			schemaName: c.SEQUENCE_COUNTER_SCHEMA_NAME,
			translationNs: c.ESSENTIAL_MODULE,
			linkField: 'id',
			searchCommand: SequenceCounterCommands.SEARCH,
			initialGraph: { order: [['updated_at', 'desc'], ['id', 'asc']] },
			fieldRenderers: { last_number: NUMBER },
		}),
		secondary: buildSequenceCounterDetailProps(routes),
	});

	return definePage({ routePath: routes.counter, template: splitView.template, props: splitView.props });
}

function buildSequenceCounterDetailProps(routes: c.SequenceRoutes) {
	return resourceDetailV2Props({
		schemaName: c.SEQUENCE_COUNTER_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		titleLvl1: { schemaField: 'scope_key' },
		titleLvl2: { schemaField: 'period_key' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: { getById: SequenceCounterCommands.GET_BY_ID },
		fieldRenderers: { last_number: NUMBER },
		childrenNodes: [collapsibleSectionNode({
			layout: 'formBlocks',
			translationNs: c.ESSENTIAL_MODULE,
			header: 'form.generalInformation',
		}, [
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['definition_id', 'scope_key', 'scope_object_id', 'period_key'],
			}),
			resourceFormColumnNode({
				header: 'form.counting',
				description: 'sequence.counter_next_note',
				fields: ['last_number', 'created_at', 'updated_at'],
			}),
		])],
		relatedResourcesNotice: 'sequence.related_notice',
		relatedResources: [buildIssuancesResource(routes, 'counter_id')],
	});
}

/** A flat read-only list: an issuance has no detail page of its own in this version (BR §8.3). */
function buildSequenceIssuancePage(routes: c.SequenceRoutes): PageNode {
	const list = resourceListV2Props({
		schemaName: c.SEQUENCE_ISSUANCE_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		searchCommand: SequenceIssuanceCommands.SEARCH,
		// Newest first, the id breaking ties so a page boundary never repeats or skips a row.
		initialGraph: { order: [['issued_at', 'desc'], ['id', 'desc']] },
		fieldRenderers: { allocated_value: NUMBER },
	});

	return definePage({ routePath: routes.issuance, template: list.template, props: list.props });
}

function buildCountersResource(routes: c.SequenceRoutes) {
	return {
		label: 'sequence_sections_counters',
		schemaName: c.SEQUENCE_COUNTER_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		searchCommand: SequenceCounterCommands.SEARCH,
		initialGraph: { if: ['definition_id', '=', '${id}'] },
		fields: ['scope_key', 'period_key', 'last_number', 'updated_at'],
		fieldRenderers: { last_number: NUMBER },
		linkField: 'id',
		linkRoutePath: routes.counter,
		showViewAll: true,
		viewAllFiltered: true,
	};
}

/** The issuances of a definition or of one counter; "View all" opens the issuance list filtered the same way. */
function buildIssuancesResource(routes: c.SequenceRoutes, parentField: 'definition_id' | 'counter_id') {
	return {
		label: 'sequence_sections_issuances',
		schemaName: c.SEQUENCE_ISSUANCE_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		searchCommand: SequenceIssuanceCommands.SEARCH,
		initialGraph: { if: [parentField, '=', '${id}'] },
		fields: ['formatted_value', 'allocated_value', 'idempotency_id', 'operation_key', 'caller_module',
			'issued_at', 'expires_at'],
		fieldRenderers: { allocated_value: NUMBER },
		linkRoutePath: routes.issuance,
		showViewAll: true,
		viewAllFiltered: true,
	};
}
