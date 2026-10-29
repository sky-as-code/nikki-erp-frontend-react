import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { RoleCommands } from '../features/role/commands';
import { ServiceCommands } from '../features/service/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Machine principals (`iam_service`), a backend resource of their own: no email, no photo, and they cannot sign
 * in, so they are never invited.
 */
export function buildServicePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildServiceListProps(),
		secondary: buildServiceDetailProps(),
	});

	return [definePage({
		routePath: 'iam_service',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildServiceListProps() {
	return resourceListV2Props({
		schemaName: c.SERVICE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		label: 'service',
		linkField: 'id',
		searchCommand: ServiceCommands.SEARCH,
		createEnabled: true,
		deleteCommand: ServiceCommands.DELETE,
		archiveCommand: ServiceCommands.SET_IS_ARCHIVED,
		updateSaveCommand: ServiceCommands.UPDATE,
		updateCommand: ServiceCommands.UPDATE,
		extraActions: [
			{ label: 'action.suspend', command: ServiceCommands.SUSPEND, supportMultiple: true, requireSelection: true },
			{ label: 'action.delete', command: ServiceCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
		fieldRenderers: {
			status: {
				renderer: 'badge',
				prefix: 'status.',
				colorMap: { draft: 'grape', active: 'green', suspended: 'orange' },
			},
		},
	});
}

function buildServiceDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SERVICE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		backLinkTitle: { linkHref: '../' },
		allStatuses: [
			{ value: 'draft', label: 'status.draft', color: 'grape' },
			{ value: 'active', label: 'status.active', color: 'green' },
			{ value: 'suspended', label: 'status.suspended', color: 'orange' },
		],
		currentStatus: { schemaField: 'status' },
		statusPlacement: 'firstSection',
		standardActionCommands: {
			getById: ServiceCommands.GET_BY_ID,
			create: ServiceCommands.CREATE,
			update: ServiceCommands.UPDATE,
			delete: ServiceCommands.DELETE,
			archive: ServiceCommands.SET_IS_ARCHIVED,
		},
		contextualActions: {
			activate: {
				label: 'action.activate',
				command: ServiceCommands.ACTIVATE,
				condition: { field: 'status', operator: 'not_equal' as const, value: 'active' },
			},
			suspend: {
				label: 'action.suspend',
				command: ServiceCommands.SUSPEND,
				condition: { field: 'status', operator: 'equal' as const, value: 'active' },
			},
		},
		createNodes: [buildServiceFieldsSection()],
		childrenNodes: [buildServiceFieldsSection()],
		relatedResources: buildAssignedRoleResources(),
	});
}

function buildServiceFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.IAM_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({ header: 'form.generalInformation', fields: ['display_name'] }),
	]);
}

/**
 * The roles assigned to this service. Services share the user assignment junction, so the role side's
 * `assigned_users` edge reaches them too; the wizard saves through `iam_service/:id/manage_roles`, which asserts
 * `manage_role_assignments` on `iam_service`.
 */
function buildAssignedRoleResources() {
	return [
		{
			label: 'service_sections_assignedRoles',
			schemaName: c.ROLE_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			searchCommand: RoleCommands.SEARCH,
			initialGraph: { if: ['assigned_users', 'linked', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'iam_role',
			// Path-relative to `/{org}/{module}/iam_service/:id`, i.e. the assignment wizard.
			extraActions: [{
				label: 'assignment.manageRoles', routePath: 'roles',
				actionCode: 'manage_role_assignments', actionResource: c.SERVICE_SCHEMA_NAME, actionScope: 'tenant' as const,
			}],
		},
	];
}
