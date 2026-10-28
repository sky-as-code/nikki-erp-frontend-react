import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFileFieldNode, resourceFormColumnNode, resourceListV2Props,
	resourceSplitViewProps,
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
		routePath: 'iam_user',
		template: splitView.template,
		props: splitView.props,
	})];
}

// On the v2 list template (`ExcelDataTable`): `updateCommand` is what turns on inline row editing,
// and is separate from `updateSaveCommand`, which the detail form saves through.
function buildUserListProps() {
	return resourceListV2Props({
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		label: 'user',
		linkField: 'id',
		searchCommand: UserCommands.SEARCH,
		createEnabled: true,
		deleteCommand: UserCommands.DELETE,
		archiveCommand: UserCommands.SET_IS_ARCHIVED,
		updateSaveCommand: UserCommands.UPDATE,
		updateCommand: UserCommands.UPDATE,
		extraActions: [
			{ label: 'action.suspend', command: UserCommands.SUSPEND, supportMultiple: true, requireSelection: true },
			{ label: 'action.delete', command: UserCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
		fieldRenderers: {
			avatar_file_id: { renderer: 'avatar', fileIdField: 'avatar_file_id' },
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

// On the v2 detail template: the assigned-roles table is a related-resource tab below the form
// rather than a collapsible section inside it.
function buildUserDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		titleLvl2: { schemaField: 'email' },
		backLinkTitle: { linkHref: '../' },
		thumbnail: { field: 'avatar', fileIdField: 'avatar_file_id' },
		allStatuses: [
			{ value: 'draft', label: 'status.draft', color: 'grape' },
			{ value: 'invited', label: 'status.invited', color: 'indigo' },
			{ value: 'active', label: 'status.active', color: 'green' },
			{ value: 'suspended', label: 'status.suspended', color: 'orange' },
		],
		currentStatus: { schemaField: 'status' },
		// In General Information rather than the toolbar, so the status reads beside the user's name.
		statusPlacement: 'firstSection',
		standardActionCommands: {
			getById: UserCommands.GET_BY_ID,
			create: UserCommands.CREATE,
			update: UserCommands.UPDATE,
			delete: UserCommands.DELETE,
			archive: UserCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildStatusActions(),
		createNodes: [buildUserFieldsSection(true)],
		childrenNodes: [buildUserFieldsSection(false)],
		relatedResources: buildAssignedRoleResources(),
	});
}

function buildStatusActions() {
	return {
		activate: {
			label: 'action.activate',
			command: UserCommands.ACTIVATE,
			condition: { field: 'status', operator: 'not_equal' as const, value: 'active' },
		},
		suspend: {
			label: 'action.suspend',
			command: UserCommands.SUSPEND,
			condition: { field: 'status', operator: 'equal' as const, value: 'active' },
		},
	};
}

/**
 * Shared by both form modes: the resource's own fields, as titled blocks. The photo picker is a
 * create-only block: an existing record changes its photo through the header thumbnail. The author
 * is shown by the Audit panel's History, not by a `created_by` field.
 */
function buildUserFieldsSection(withAvatarPicker: boolean): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.IAM_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['display_name', 'email'],
		}),
		...(withAvatarPicker
			? [resourceFileFieldNode({ field: 'avatar', fileIdField: 'avatar_file_id', label: 'fields.avatar_file_id' })]
			: []),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}),
	]);
}

/**
 * The roles assigned to this user, read from the role side of the same many-to-many edge that
 * `role.ts` reads from the other side: `assigned_users` is the inverse of `iam_user.roles`,
 * and `linked` is the membership operator for a many edge. No dedicated endpoint is needed.
 */
function buildAssignedRoleResources() {
	return [
		{
			label: 'user_sections_assignedRoles',
			schemaName: c.ROLE_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			searchCommand: RoleCommands.SEARCH,
			initialGraph: { if: ['assigned_users', 'linked', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'iam_role',
			// Path-relative to `/{org}/{module}/iam_user/:id`, i.e. the assignment wizard.
			extraActions: [{
				label: 'assignment.manageRoles', routePath: 'roles',
				actionCode: 'manage_role_assignments', actionResource: c.USER_SCHEMA_NAME, actionScope: 'tenant' as const,
			}],
		},
	];
}
