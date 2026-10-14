import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { GroupCommands } from '../features/group/commands';
import { RoleCommands } from '../features/role/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildGroupPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildGroupListProps(),
		secondary: buildGroupDetailProps(),
	});

	return [definePage({
		routePath: 'iam_group',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildGroupListProps() {
	return resourceListV2Props({
		schemaName: c.GROUP_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: GroupCommands.SEARCH,
		createEnabled: true,
		deleteCommand: GroupCommands.DELETE,
		updateSaveCommand: GroupCommands.UPDATE,
		updateCommand: GroupCommands.UPDATE,
		extraActions: [
			{ label: 'action.delete', command: GroupCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
	});
}

function buildGroupDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.GROUP_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'description' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: GroupCommands.GET_BY_ID,
			create: GroupCommands.CREATE,
			update: GroupCommands.UPDATE,
			delete: GroupCommands.DELETE,
		},
		createNodes: [buildGroupFieldsSection()],
		childrenNodes: [buildGroupFieldsSection()],
		relatedResources: [buildAssignedRolesResource()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildGroupFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.IAM_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['name', 'description'],
		}),
	]);
}

/** Group counterpart of the user page's section; `assigned_groups` is the matching edge. */
function buildAssignedRolesResource() {
	return {
		label: 'group_sections_assignedRoles',
		schemaName: c.ROLE_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		searchCommand: RoleCommands.SEARCH,
		initialGraph: { if: ['assigned_groups', 'linked', '${id}'] },
		linkField: 'id',
		linkRoutePath: 'iam_role',
		extraActions: [{ label: 'assignment.manageRoles', routePath: 'iam_role' }],
	};
}
