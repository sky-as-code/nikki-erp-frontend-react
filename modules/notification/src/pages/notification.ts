import { definePage } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { NotificationCommands } from '../features/notification/commands';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


/**
 * The full notification list.
 *
 * Read-only throughout: there is no create, no update, no delete and no archive. A notification is
 * written by the module that raised it, and the only change a person makes to one is marking it
 * read — which is the bell's job, not a form's.
 */
export function buildNotificationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildNotificationListProps(),
		secondary: buildNotificationDetailProps(),
	});

	return [definePage({
		routePath: 'notifications',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildNotificationListProps() {
	return resourceListProps({
		schemaName: c.NOTIFICATION_SCHEMA_NAME,
		translationNs: c.NOTIFICATION_MODULE,
		linkField: 'id',
		searchCommand: NotificationCommands.SEARCH,
		createEnabled: false,
	});
}

function buildNotificationDetailProps() {
	return resourceDetailProps({
		schemaName: c.NOTIFICATION_SCHEMA_NAME,
		translationNs: c.NOTIFICATION_MODULE,
		titleLvl1: { schemaField: 'title' },
		titleLvl2: { schemaField: 'source_module' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: NotificationCommands.GET_BY_ID,
		},
		childrenNodes: [buildNotificationFieldsSection()],
	});
}

function buildNotificationFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.NOTIFICATION_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					fields: ['title', 'message', 'severity', 'created_at', 'expires_at'],
				}),
			},
			{
				key: 'source',
				header: 'form.source',
				content: resourceFormColumnNode({
					header: 'form.source',
					fields: ['source_module', 'source_resource_name', 'source_resource_key', 'metadata'],
				}),
			},
			{
				key: 'distribution',
				header: 'form.distribution',
				content: resourceFormColumnNode({
					header: 'form.distribution',
					fields: ['distribution_mode', 'requested_channels', 'org_id'],
				}),
			},
		],
	});
}
