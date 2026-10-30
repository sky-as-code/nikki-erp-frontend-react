import { definePage } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
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
		routePath: 'notification_notification',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildNotificationListProps() {
	return resourceListV2Props({
		schemaName: c.NOTIFICATION_SCHEMA_NAME,
		translationNs: c.NOTIFICATION_MODULE,
		linkField: 'id',
		searchCommand: NotificationCommands.SEARCH,
		createEnabled: false,
	});
}

function buildNotificationDetailProps() {
	return resourceDetailV2Props({
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
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.NOTIFICATION_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['title', 'message', 'severity', 'expires_at'],
		}),
		resourceFormColumnNode({
			header: 'form.source',
			fields: ['source_module', 'source_resource_name', 'source_resource_key', 'metadata'],
		}),
		resourceFormColumnNode({
			header: 'form.distribution',
			fields: ['distribution_mode', 'requested_channels'],
		}),
	]);
}
