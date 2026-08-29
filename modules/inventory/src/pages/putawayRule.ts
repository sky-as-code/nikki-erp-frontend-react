import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { PutawayRuleCommands } from '../features/putawayRule/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildPutawayRulePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildPutawayRuleListProps(),
		secondary: buildPutawayRuleDetailProps(),
	});

	return [definePage({
		routePath: 'putaway_rules',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildPutawayRuleListProps() {
	return resourceListProps({
		schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: PutawayRuleCommands.SEARCH,
		createEnabled: true,
		deleteCommand: PutawayRuleCommands.DELETE,
		archiveCommand: PutawayRuleCommands.SET_IS_ARCHIVED,
		updateSaveCommand: PutawayRuleCommands.UPDATE,
		fieldRenderers: {
			sublocation_strategy: {
				renderer: 'badge',
				colorMap: {
					fixed: 'blue',
					last_used: 'teal',
					category: 'indigo',
				},
				prefix: 'sublocation_strategy.',
			},
		},
	});
}

function buildPutawayRuleDetailProps() {
	return resourceDetailProps({
		schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'code' },
		titleLvl2: { schemaField: 'warehouse_id' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: PutawayRuleCommands.GET_BY_ID,
			create: PutawayRuleCommands.CREATE,
			update: PutawayRuleCommands.UPDATE,
			delete: PutawayRuleCommands.DELETE,
			archive: PutawayRuleCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildPutawayRuleFieldsSection()],
		childrenNodes: [buildPutawayRuleFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildPutawayRuleFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					fields: ['code', 'warehouse_id', 'priority', 'org_id'],
				}),
			},
			{
				key: 'location_topology',
				header: 'form.locationTopology',
				content: resourceFormColumnNode({
					// Where goods arrive and where the rule sends them. Both must be in the warehouse
					// above: a putaway rule is not a way to move goods between warehouses.
					header: 'form.locationTopology',
					fields: ['source_location_id', 'destination_location_id', 'sublocation_strategy'],
				}),
			},
			{
				key: 'matching_criteria',
				header: 'form.matchingCriteria',
				content: resourceFormColumnNode({
					// A criterion left empty matches anything, which is what makes a general rule general.
					header: 'form.matchingCriteria',
					fields: ['storage_category_id', 'product_id', 'product_category_id', 'package_type_id'],
				}),
			},
			{
				key: 'audit',
				header: 'form.audit',
				content: resourceFormColumnNode({
					header: 'form.audit',
					fields: ['created_at', 'updated_at'],
				}),
			},
		],
	});
}
