import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesPointCommands } from '../../features/sales/salesPoint/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: { active: 'green', suspended: 'orange' },
	prefix: 'status.',
} as const;

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
		routePath: 'sales_point',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPointListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_POINT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPointCommands.SEARCH,
		updateCommand: SalesPointCommands.UPDATE,
		createEnabled: true,
		fieldRenderers: {
			status: STATUS_BADGE,
		},
	});
}

function buildSalesPointDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_POINT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		...statusStripProps({
			statuses: Object.keys(STATUS_BADGE.colorMap),
			prefix: STATUS_BADGE.prefix,
			alternativeEnds: ['suspended'],
		}),
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
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.point',
			fields: ['sales_channel_id', 'name', 'code'],
		}),
		resourceFormColumnNode({
			header: 'form.external',
			// How another module names this point. Unique within the channel, which makes it an
			// idempotency handle for provisioning.
			fields: ['external_reference_id', 'external_reference_type'],
		}),
	]);
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
			actionCode: 'suspend',
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_ACTIVE,
			},
		},
		activate: {
			label: 'actions.activate',
			command: SalesPointCommands.ACTIVATE,
			actionCode: 'activate',
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_SUSPENDED,
			},
		},
		archive: {
			label: 'actions.archive',
			command: SalesPointCommands.ARCHIVE,
			actionCode: 'set_archived',
			condition: {
				field: 'is_archived',
				operator: 'not_equal' as const,
				value: true,
			},
		},
		unarchive: {
			label: 'actions.unarchive',
			command: SalesPointCommands.UNARCHIVE,
			actionCode: 'set_archived',
			condition: {
				field: 'is_archived',
				operator: 'equal' as const,
				value: true,
			},
		},
	};
}
