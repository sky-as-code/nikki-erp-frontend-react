import { definePage, PageNode } from '@nikkierp/viewengine/metadata';

import * as c from '../constants';
import { GroupCommands } from '../features/group/commands';
import { RoleCommands } from '../features/role/commands';
import { UserCommands } from '../features/user/commands';
import { roleAssignmentProps } from '../viewkit/props';


/**
 * The two-stage "assign roles to this principal" pages. Both stages share one URL, so the
 * template contributes no extra route segment and there is one page per principal kind.
 */
export function buildRoleAssignmentPages(): PageNode[] {
	return [
		buildPage('users/:id/roles', {
			principalSchemaName: c.USER_SCHEMA_NAME,
			principalDisplayField: 'display_name',
			getPrincipalCommand: UserCommands.GET_BY_ID,
			assignedRolesCommand: UserCommands.SEARCH_ASSIGNED_ROLES,
			saveCommand: UserCommands.MANAGE_ROLE_ASSIGNMENTS,
		}),
		buildPage('groups/:id/roles', {
			principalSchemaName: c.GROUP_SCHEMA_NAME,
			principalDisplayField: 'name',
			getPrincipalCommand: GroupCommands.GET_BY_ID,
			assignedRolesCommand: GroupCommands.SEARCH_ASSIGNED_ROLES,
			saveCommand: GroupCommands.MANAGE_ROLE_ASSIGNMENTS,
		}),
	];
}

type PrincipalConfig = {
	principalSchemaName: string,
	principalDisplayField: string,
	getPrincipalCommand: string,
	assignedRolesCommand: string,
	saveCommand: string,
};

function buildPage(routePath: string, principal: PrincipalConfig): PageNode {
	const ref = roleAssignmentProps({
		...principal,
		translationNs: c.IAM_MODULE,
		titleKey: 'assignment.rolesOf',
		roleSearchCommand: RoleCommands.SEARCH,
		describeCommand: RoleCommands.DESCRIBE,
		// Up one URL segment from `{users|groups}/:id/roles`, i.e. back to the detail page.
		// `ViewEngineRouter` registers every page as its own flat route, so React Router's
		// default route-relative `'..'` would pop the whole route and land on the module root;
		// the template navigates with `{ relative: 'path' }` instead.
		backRoutePath: '..',
	});
	return definePage({ routePath, template: ref.template, props: ref.props });
}
