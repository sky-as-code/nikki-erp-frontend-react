import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesPointCommands } from '../features/salesPoint/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * `sales_channel_id` is immutable once set: every order rung up here records that channel, so moving
 * a point between channels would rewrite the provenance of sales already made. The channel of record
 * is derived from the point, not the request, so a till cannot claim a sale happened elsewhere.
 */
export function buildSalesPointPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPointListProps(),
		secondary: buildSalesPointDetailProps(),
	});

	return [definePage({
		routePath: 'sales_points',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPointListProps() {
	return resourceListProps({
		schemaName: c.SALES_POINT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPointCommands.SEARCH,
		createEnabled: true,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: { active: 'green', suspended: 'orange' },
				prefix: 'status.',
			},
		},
	});
}

function buildSalesPointDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_POINT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesPointCommands.GET_BY_ID,
			create: SalesPointCommands.CREATE,
			update: SalesPointCommands.UPDATE,
		},
		contextualActions: buildSalesPointActions(),
		createNodes: [buildSalesPointFieldsSection()],
		childrenNodes: [buildSalesPointFieldsSection()],
	});
}

function buildSalesPointFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.point',
				fields: ['sales_channel_id', 'name', 'code', 'status'],
			}),
			resourceFormColumnNode({
				header: 'form.external',
				// How another module names this point. Unique within the channel, which makes it an
				// idempotency handle for provisioning.
				fields: ['external_reference_id', 'external_reference_type'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				fields: ['org_id', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * Unlike a channel, a point has both `archive` and `unarchive`: a till taken out of service and
 * later brought back is ordinary.
 */
function buildSalesPointActions() {
	return {
		suspend: {
			label: 'actions.suspend',
			command: SalesPointCommands.SUSPEND,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_ACTIVE,
			},
		},
		activate: {
			label: 'actions.activate',
			command: SalesPointCommands.ACTIVATE,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_SUSPENDED,
			},
		},
		archive: {
			label: 'actions.archive',
			command: SalesPointCommands.ARCHIVE,
			condition: {
				field: 'is_archived',
				operator: 'not_equal' as const,
				value: true,
			},
		},
		unarchive: {
			label: 'actions.unarchive',
			command: SalesPointCommands.UNARCHIVE,
			condition: {
				field: 'is_archived',
				operator: 'equal' as const,
				value: true,
			},
		},
	};
}
