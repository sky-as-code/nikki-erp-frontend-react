import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesChannelCommands } from '../../features/sales/salesChannel/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: { active: 'green', suspended: 'orange' },
	prefix: 'status.',
} as const;

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
		routePath: 'sales_channel',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesChannelListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_CHANNEL_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesChannelCommands.SEARCH,
		updateCommand: SalesChannelCommands.UPDATE,
		createEnabled: true,
		fieldRenderers: {
			status: STATUS_BADGE,
		},
	});
}

function buildSalesChannelDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_CHANNEL_SCHEMA_NAME,
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
			getById: SalesChannelCommands.GET_BY_ID,
			create: SalesChannelCommands.CREATE,
			update: SalesChannelCommands.UPDATE,
		},
		contextualActions: buildSalesChannelActions(),
		createNodes: [buildSalesChannelFieldsSection(false)],
		childrenNodes: [buildSalesChannelFieldsSection(true)],
	});
}

function buildSalesChannelFieldsSection(isUpdate: boolean): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.channel',
			// `is_system` marks channels the platform creates for itself; editing one by hand
			// is how a kiosk network loses the channel its tills are configured with.
			// The two automation flags are snapshotted onto every order this channel takes at
			// create; changing them here never reaches an existing order.
			fields: ['code', 'name', 'description', 'auto_confirm_order', 'auto_confirm_refund'],
		}),
		resourceFormColumnNode({
			header: 'form.other_information',
			// Ownership is set by the module that provisions the channel, never by hand, so it is
			// only shown once the channel exists (`no_update` keeps it read-only there).
			fields: [...(isUpdate ? ['managed_by_type'] : []), 'is_system'],
		}),
	]);
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
			actionCode: 'suspend',
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.CHANNEL_STATUS_ACTIVE,
			},
		},
		activate: {
			label: 'actions.activate',
			command: SalesChannelCommands.ACTIVATE,
			actionCode: 'activate',
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
			actionCode: 'set_archived',
		},
	};
}
