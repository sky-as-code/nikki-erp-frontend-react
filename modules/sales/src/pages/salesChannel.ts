import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesChannelCommands } from '../features/salesChannel/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * `code` is immutable once set — a till names it to open a sale, so changing it would orphan every
 * point and order referring to it. The rule lives in the backend domain service, not the schema, so
 * the form still shows the field and the refusal is the enforcement.
 */
export function buildSalesChannelPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesChannelListProps(),
		secondary: buildSalesChannelDetailProps(),
	});

	return [definePage({
		routePath: 'sales_channels',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesChannelListProps() {
	return resourceListProps({
		schemaName: c.SALES_CHANNEL_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesChannelCommands.SEARCH,
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

function buildSalesChannelDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_CHANNEL_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesChannelCommands.GET_BY_ID,
			create: SalesChannelCommands.CREATE,
			update: SalesChannelCommands.UPDATE,
		},
		contextualActions: buildSalesChannelActions(),
		createNodes: [buildSalesChannelFieldsSection()],
		childrenNodes: [buildSalesChannelFieldsSection()],
	});
}

function buildSalesChannelFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.channel',
				// `is_system` marks channels the platform creates for itself; editing one by hand
				// is how a kiosk network loses the channel its tills are configured with.
				fields: ['code', 'name', 'description', 'status'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				fields: ['managed_by_module', 'is_system', 'org_id', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * Suspending stops new sales without touching what was already sold; archiving retires the channel
 * altogether. The payment-method actions are registered as commands but not offered here: they need
 * a `payment_method_id`, and a prompt can only collect fields of the page's own resource.
 */
function buildSalesChannelActions() {
	return {
		suspend: {
			label: 'actions.suspend',
			command: SalesChannelCommands.SUSPEND,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_ACTIVE,
			},
		},
		activate: {
			label: 'actions.activate',
			command: SalesChannelCommands.ACTIVATE,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_SUSPENDED,
			},
		},
		// Offered whatever the status: retiring a channel is a decision about its future.
		archive: {
			label: 'actions.archive',
			command: SalesChannelCommands.ARCHIVE,
		},
	};
}
