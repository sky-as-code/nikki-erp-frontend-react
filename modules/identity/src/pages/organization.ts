import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { OrganizationCommands } from '../features/organization/commands';
import { orgLifecycleStatusNode } from '../viewkit/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildOrganizationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildOrganizationListProps(),
		secondary: buildOrganizationDetailProps(),
	});

	return [definePage({
		routePath: 'iam_org',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildOrganizationListProps() {
	return resourceListV2Props({
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: OrganizationCommands.SEARCH,
		createEnabled: true,
		deleteCommand: OrganizationCommands.DELETE,
		archiveCommand: OrganizationCommands.SET_IS_ARCHIVED,
		updateSaveCommand: OrganizationCommands.UPDATE,
		updateCommand: OrganizationCommands.UPDATE,
		extraActions: [
			{
				label: 'action.delete',
				command: OrganizationCommands.DELETE,
				supportMultiple: true,
				requireSelection: true,
			},
		],
		fieldRenderers: {
			status: {
				renderer: 'badge',
				prefix: 'status.',
				colorMap: {
					provisioning: 'yellow',
					ready: 'green',
					deleted: 'red',
				},
			},
		},
	});
}

function buildOrganizationDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		titleLvl2: { schemaField: 'slug' },
		backLinkTitle: { linkHref: '../' },
		allStatuses: [
			{ value: 'provisioning', label: 'status.provisioning', color: 'yellow' },
			{ value: 'ready', label: 'status.ready', color: 'green' },
			{ value: 'deleted', label: 'status.deleted', color: 'red' },
		],
		currentStatus: { schemaField: 'status' },
		standardActionCommands: {
			getById: OrganizationCommands.GET_BY_ID,
			create: OrganizationCommands.CREATE,
			update: OrganizationCommands.UPDATE,
			delete: OrganizationCommands.DELETE,
			archive: OrganizationCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildOrganizationFieldsSection()],
		// The lifecycle banner is for a saved org only: a new one has no status until it is created.
		childrenNodes: [orgLifecycleStatusNode(), buildOrganizationFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildOrganizationFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.IAM_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['display_name', 'slug', 'legal_name'],
		}),
		resourceFormColumnNode({
			header: 'form.contact',
			fields: ['address', 'phone_number'],
		}),
	]);
}
