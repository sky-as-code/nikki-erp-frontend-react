import {
	PageNode, RESOURCE_SPLIT_VIEW_TEMPLATE, resolveFieldRendererMap, ResourceDetailTemplateProps,
	ResourceListTemplateProps, ResourceSplitViewTemplateProps,
} from '@nikkierp/ui/viewEngine';

import * as c from '../constants';
import { UserCommands } from '../features/user/commands';


export function registerUserPages(): PageNode[] {
	return [createUserSplitViewPage()];
}

function createUserSplitViewPage(): PageNode {
	return {
		type: 'page',
		routePath: 'users',
		template: RESOURCE_SPLIT_VIEW_TEMPLATE,
		props: createUserSplitViewProps(),
	};
}

function createUserSplitViewProps(): ResourceSplitViewTemplateProps {
	return new ResourceSplitViewTemplateProps({
		primaryProps: createUserListProps(),
		secondaryProps: createUserDetailProps(),
	});
}

function createUserListProps(): ResourceListTemplateProps {
	return new ResourceListTemplateProps({
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: UserCommands.SEARCH,
		createEnabled: true,
		deleteCommand: UserCommands.DELETE,
		archiveCommand: UserCommands.SET_IS_ARCHIVED,
		updateSaveCommand: UserCommands.UPDATE,
		extraActions: [
			{ label: 'action.suspend', command: UserCommands.SUSPEND, supportMultiple: true, requireSelection: true },
			{ label: 'action.delete', command: UserCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
		fieldRenderer: resolveFieldRendererMap({
			avatar_url: { renderer: 'avatar' },
			status: {
				renderer: 'badge',
				prefix: 'status.',
				colorMap: {
					invited: 'indigo',
					active: 'green',
					locked: 'orange',
					terminated: 'gray',
				},
			},
		}),
	});
}

function createUserDetailProps(): ResourceDetailTemplateProps {
	return new ResourceDetailTemplateProps({
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		titleLvl2: { schemaField: 'email' },
		titleLvl3: { linkHref: '../' },
		allStatuses: [
			{ value: 'draft', label: 'status.draft', color: 'grape' },
			{ value: 'invited', label: 'status.invited', color: 'indigo' },
			{ value: 'active', label: 'status.active', color: 'green' },
			{ value: 'suspended', label: 'status.suspended', color: 'orange' },
		],
		currentStatus: { schemaField: 'status' },
		standardActionCommands: {
			getById: UserCommands.GET_BY_ID,
			create: UserCommands.CREATE,
			update: UserCommands.UPDATE,
			delete: UserCommands.DELETE,
			archive: UserCommands.SET_IS_ARCHIVED,
		},
		contextualActions: {
			activate: {
				label: 'action.activate',
				command: UserCommands.ACTIVATE,
				condition: { field: 'status', operator: 'not_equal', value: 'active' },
			},
			suspend: {
				label: 'action.suspend',
				command: UserCommands.SUSPEND,
				condition: { field: 'status', operator: 'equal', value: 'active' },
			},
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['display_name', 'email'],
		}, {
			header: 'form.security',
			fields: ['created_at', 'updated_at'],
		}],
	});
}
