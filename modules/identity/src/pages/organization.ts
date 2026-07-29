import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceListProps, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { OrganizationCommands } from '../features/organization/commands';


export function buildOrganizationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildOrganizationListProps(),
		secondary: buildOrganizationDetailProps(),
	});

	return [definePage({
		routePath: 'organizations',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildOrganizationListProps() {
	return resourceListProps({
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: OrganizationCommands.SEARCH,
		createEnabled: true,
		deleteCommand: OrganizationCommands.DELETE,
		archiveCommand: OrganizationCommands.SET_IS_ARCHIVED,
		updateSaveCommand: OrganizationCommands.UPDATE,
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
					active: 'green',
					archived: 'gray',
				},
			},
		},
	});
}

function buildOrganizationDetailProps() {
	return resourceDetailProps({
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		titleLvl2: { schemaField: 'slug' },
		titleLvl3: { linkHref: '../' },
		allStatuses: [
			{ value: 'active', label: 'status.active', color: 'green' },
			{ value: 'archived', label: 'status.archived', color: 'gray' },
		],
		currentStatus: { schemaField: 'status' },
		standardActionCommands: {
			getById: OrganizationCommands.GET_BY_ID,
			create: OrganizationCommands.CREATE,
			update: OrganizationCommands.UPDATE,
			delete: OrganizationCommands.DELETE,
			archive: OrganizationCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['display_name', 'slug', 'legal_name'],
		}, {
			header: 'form.contact',
			fields: ['address', 'phone_number'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
	});
}
