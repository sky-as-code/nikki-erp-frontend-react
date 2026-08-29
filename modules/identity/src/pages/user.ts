import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { RoleCommands } from '../features/role/commands';
import { UserCommands } from '../features/user/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildUserPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildUserListProps(),
		secondary: buildUserDetailProps(),
	});

	return [definePage({
		routePath: 'users',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildUserListProps() {
	return resourceListProps({
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
		fieldRenderers: {
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
		},
	});
}

function buildUserDetailProps() {
	return resourceDetailProps({
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		titleLvl2: { schemaField: 'email' },
		backLinkTitle: { linkHref: '../' },
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
		createNodes: [buildUserFieldsSection()],
		childrenNodes: [buildUserFieldsSection(), buildAssignedRolesSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildUserFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.IAM_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					fields: ['display_name', 'email'],
				}),
			},
			{
				key: 'security',
				header: 'form.security',
				content: resourceFormColumnNode({
					header: 'form.security',
					fields: ['created_at', 'updated_at'],
				}),
			},
		],
	});
}

/**
 * The roles assigned to this user, read from the role side of the same many-to-many edge that
 * `role.ts` reads from the other side: `assigned_users` is the inverse of `iam_user.roles`,
 * and `linked` is the membership operator for a many edge. No dedicated endpoint is needed.
 */
function buildAssignedRolesSection(): ComponentNode {
	return collapsibleSectionNode(
		{
			header: 'user_sections_assignedRoles',
			translationNs: c.IAM_MODULE,
		},
		[resourceTableNode({
			schemaName: c.ROLE_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			searchCommand: RoleCommands.SEARCH,
			filterGraph: { if: ['assigned_users', 'linked', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'roles',
			// Path-relative to `/{org}/{module}/users/:id`, i.e. the assignment wizard for this user.
			extraActions: [{ label: 'assignment.manageRoles', routePath: 'roles' }],
		})],
	);
}
