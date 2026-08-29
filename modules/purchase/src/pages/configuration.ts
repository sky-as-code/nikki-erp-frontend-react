import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { ConfigurationCommands } from '../features/configuration/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The organization's purchase settings: whether an order needs approving, and above what total.
 *
 * There is one record per organization, so this reads oddly as a list of one. It stays a split
 * view all the same, because the alternative â€” a detail page with no id in the route â€” has no
 * template here, and a list that happens to be short is better than a page that cannot resolve
 * which record it is editing.
 *
 * Deleting is not offered. An organization with no configuration row falls back to the backend's
 * defaults (`one_step`, no threshold, edits allowed), which is a silent change to how every future
 * order is approved â€” reachable by editing the mode instead, where it is visible.
 */
export function buildConfigurationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildConfigurationListProps(),
		secondary: buildConfigurationDetailProps(),
	});

	return [definePage({
		routePath: 'configuration',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildConfigurationListProps() {
	return resourceListProps({
		schemaName: c.CONFIGURATION_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		linkField: 'id',
		searchCommand: ConfigurationCommands.SEARCH,
		createEnabled: true,
		fieldRenderers: {
			// Two-step is the one that changes what happens on confirmation, so it is the one
			// coloured. One-step is the default and reads as unremarkable, which it is.
			approval_mode: {
				renderer: 'badge',
				colorMap: { one_step: 'gray', two_step: 'orange' },
				prefix: 'approval_mode.',
			},
			po_modification_policy: {
				renderer: 'badge',
				colorMap: { allow_edit: 'gray', auto_lock: 'blue' },
				prefix: 'po_modification_policy.',
			},
		},
	});
}

/**
 * The settings form.
 *
 * No contextual actions: configuration has no lifecycle. It is read on every order confirmation to
 * decide whether approval is required, and changed by editing it.
 */
function buildConfigurationDetailProps() {
	return resourceDetailProps({
		schemaName: c.CONFIGURATION_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		titleLvl1: { schemaField: 'approval_mode' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: ConfigurationCommands.GET_BY_ID,
			create: ConfigurationCommands.CREATE,
			update: ConfigurationCommands.UPDATE,
		},
		createNodes: [buildConfigurationFieldsSection()],
		childrenNodes: [buildConfigurationFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildConfigurationFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.PURCHASE_MODULE,
		tabs: [
			{
				key: 'approval',
				header: 'form.approval',
				content: resourceFormColumnNode({
					header: 'form.approval',
					// An empty threshold under `two_step` means every order needs approval, not none â€”
					// the backend reads a missing threshold as "always". Under `one_step` it is ignored.
					fields: ['approval_mode', 'approval_threshold'],
				}),
			},
			{
				key: 'other',
				header: 'form.other_information',
				content: resourceFormColumnNode({
					header: 'form.other_information',
					fields: ['po_modification_policy', 'org_id', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}
