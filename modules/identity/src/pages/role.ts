import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { GroupCommands } from '../features/group/commands';
import { RoleCommands } from '../features/role/commands';
import { ServiceCommands } from '../features/service/commands';
import { UserCommands } from '../features/user/commands';
import { rolePermissionsNode } from '../viewkit/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildRolePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildRoleListProps(),
		secondary: buildRoleDetailProps(),
	});

	return [definePage({
		routePath: 'iam_role',
		template: splitView.template,
		props: splitView.props,
	})];
}

/** On the v2 list template (`ExcelDataTable`): same actions as before, plus inline row editing. */
function buildRoleListProps() {
	return resourceListV2Props({
		schemaName: c.ROLE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: RoleCommands.SEARCH,
		createEnabled: true,
		deleteCommand: RoleCommands.DELETE,
		archiveCommand: RoleCommands.SET_IS_ARCHIVED,
		updateSaveCommand: RoleCommands.UPDATE,
		updateCommand: RoleCommands.UPDATE,
		extraActions: [
			{ label: 'action.delete', command: RoleCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
	});
}

/** On the v2 detail template: the assignment tables are related-resource tabs below the form. */
function buildRoleDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.ROLE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'description' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: RoleCommands.GET_BY_ID,
			create: RoleCommands.CREATE,
			update: RoleCommands.UPDATE,
			delete: RoleCommands.DELETE,
			archive: RoleCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildRoleFieldsSection()],
		childrenNodes: [buildRoleFieldsSection(), buildRolePermissionSection()],
		relatedResources: buildAssignmentResources(),
		relatedResourcesNotice: 'role_relatedNotice',
	});
}

/**
 * The resource's own fields, as titled blocks, the same on create and update. `org_id` is shown on
 * neither: `iam_role` opts out of org scoping, so nothing seeds it either, and a new role is
 * tenant-wide (NULL org).
 */
function buildRoleFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.IAM_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['name', 'description'],
		}),
		resourceFormColumnNode({
			// Exactly one of these must be set; the backend enforces it via
			// ExclusiveRequiredFields, the generated form cannot express it.
			header: 'form.ownership',
			fields: ['owner_user_id', 'owner_group_id'],
		}),
		resourceFormColumnNode({
			header: 'form.requestSettings',
			fields: ['is_private', 'is_requestable', 'is_required_comment', 'is_required_attachment'],
		}),
		resourceFormColumnNode({
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}),
	]);
}

/** Below the fields on an existing role only; its grants and revokes are saved with the role's Save. */
function buildRolePermissionSection(): ComponentNode {
	return collapsibleSectionNode({
		translationNs: c.IAM_MODULE,
		header: 'role_sections_permission',
	}, [rolePermissionsNode()]);
}

/**
 * The backend exposes no `/roles/:id/users`; assignment is read through the generic
 * search with the `linked` edge operator, from the principal's side. `roles` is the
 * inverse edge on iam_user, iam_service and iam_group. It is written through the role-side
 * `manage_users` / `manage_services` / `manage_groups`, which assert what the principal side asserts.
 */
function buildAssignmentResources() {
	return [
		{
			label: 'role_sections_assignedUsers',
			emptyMessage: 'role_assign_emptyUsers',
			schemaName: c.USER_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			searchCommand: UserCommands.SEARCH,
			initialGraph: { if: ['roles', 'linked', '${id}'] },
			fields: ['avatar_file_id', 'display_name', 'email'],
			fieldRenderers: { avatar_file_id: { renderer: 'avatar', fileIdField: 'avatar_file_id' } },
			linkField: 'id',
			linkRoutePath: 'iam_user',
			assignment: {
				...assignmentLock(c.USER_SCHEMA_NAME),
				pickerSchemaName: c.USER_SCHEMA_NAME,
				manageCommand: RoleCommands.MANAGE_USERS,
				newRowPrompt: 'role_assign_newUser',
				newRowSearchField: 'display_name',
				btnDeleteLabel: 'common:action.unassign',
			},
		},
		assignedServicesResource(),
		{
			label: 'role_sections_assignedGroups',
			emptyMessage: 'role_assign_emptyGroups',
			schemaName: c.GROUP_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			searchCommand: GroupCommands.SEARCH,
			initialGraph: { if: ['roles', 'linked', '${id}'] },
			fields: ['name'],
			linkField: 'id',
			linkRoutePath: 'iam_group',
			assignment: {
				...assignmentLock(c.GROUP_SCHEMA_NAME),
				pickerSchemaName: c.GROUP_SCHEMA_NAME,
				manageCommand: RoleCommands.MANAGE_GROUPS,
				newRowPrompt: 'role_assign_newGroup',
				btnDeleteLabel: 'common:action.unassign',
			},
		},
	];
}

/** Services share the user junction; the role side reads them through `iam_service.roles` and writes them apart. */
function assignedServicesResource() {
	return {
		label: 'role_sections_assignedServices',
		emptyMessage: 'role_assign_emptyServices',
		schemaName: c.SERVICE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		searchCommand: ServiceCommands.SEARCH,
		initialGraph: { if: ['roles', 'linked', '${id}'] },
		fields: ['display_name'],
		linkField: 'id',
		linkRoutePath: 'iam_service',
		assignment: {
			...assignmentLock(c.SERVICE_SCHEMA_NAME),
			pickerSchemaName: c.SERVICE_SCHEMA_NAME,
			manageCommand: RoleCommands.MANAGE_SERVICES,
			newRowPrompt: 'role_assign_newService',
			newRowSearchField: 'display_name',
			btnDeleteLabel: 'common:action.unassign',
		},
	};
}

/** The assert never names an org, so only a tenant grant satisfies it — as on the principal pages. */
function assignmentLock(principalSchemaName: string) {
	return {
		actionCode: 'manage_role_assignments',
		actionResource: principalSchemaName,
		actionScope: 'tenant' as const,
	};
}
