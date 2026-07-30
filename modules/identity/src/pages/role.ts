import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsiblePanelNode, resourceDetailProps, resourceListProps, resourceSplitViewProps,
	resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { GroupCommands } from '../features/group/commands';
import { RoleCommands } from '../features/role/commands';
import { UserCommands } from '../features/user/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildRolePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildRoleListProps(),
		secondary: buildRoleDetailProps(),
	});

	return [definePage({
		routePath: 'roles',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildRoleListProps() {
	return resourceListProps({
		schemaName: c.ROLE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: RoleCommands.SEARCH,
		createEnabled: true,
		deleteCommand: RoleCommands.DELETE,
		archiveCommand: RoleCommands.SET_IS_ARCHIVED,
		updateSaveCommand: RoleCommands.UPDATE,
		extraActions: [
			{ label: 'action.delete', command: RoleCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
		fieldRenderers: {
			is_private: { renderer: 'badge', colorMap: { true: 'orange', false: 'gray' } },
		},
	});
}

function buildRoleDetailProps() {
	return resourceDetailProps({
		schemaName: c.ROLE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'description' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: RoleCommands.GET_BY_ID,
			create: RoleCommands.CREATE,
			update: RoleCommands.UPDATE,
			delete: RoleCommands.DELETE,
			archive: RoleCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['name', 'description', 'org_id'],
		}, {
			// Exactly one of these must be set; the backend enforces it via
			// ExclusiveRequiredFields, the generated form cannot express it.
			header: 'form.ownership',
			fields: ['owner_user_id', 'owner_group_id'],
		}, {
			header: 'form.requestSettings',
			fields: ['is_private', 'is_requestable', 'is_required_comment', 'is_required_attachment'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
		childrenNodes: buildAssignmentPanels(),
	});
}

/**
 * The backend exposes no `/roles/:id/users`; assignment is read through the generic
 * search with the `linked` edge operator, from the principal's side. `roles` is the
 * inverse edge on both iam_user and iam_group.
 */
function buildAssignmentPanels(): ComponentNode[] {
	return [
		collapsiblePanelNode(
			{ header: 'role_sections_assignedUsers', translationNs: c.IAM_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.USER_SCHEMA_NAME,
				translationNs: c.IAM_MODULE,
				searchCommand: UserCommands.SEARCH,
				filterGraph: { if: ['roles', 'linked', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'users',
			})],
		),
		collapsiblePanelNode(
			{ header: 'role_sections_assignedGroups', translationNs: c.IAM_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.GROUP_SCHEMA_NAME,
				translationNs: c.IAM_MODULE,
				searchCommand: GroupCommands.SEARCH,
				filterGraph: { if: ['roles', 'linked', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'groups',
			})],
		),
	];
}
