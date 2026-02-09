import { ACTIONS, RESOURCES, useHasAnyPermission, PermissionScopeType } from '@nikkierp/shell/userContext';
import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';


type ContextScope = { scopeType: PermissionScopeType; scopeRef: string };

export function useMenuBarItems(contextScope?: ContextScope): MenuBarItem[] {
	const hasUserAccess = useHasAnyPermission(
		RESOURCES.IDENTITY_USER,
		[ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		contextScope,
	);
	const hasGroupAccess = useHasAnyPermission(
		RESOURCES.IDENTITY_GROUP,
		[ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		contextScope,
	);
	const hasOrgAccess = useHasAnyPermission(
		RESOURCES.IDENTITY_ORGANIZATION,
		[ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		contextScope,
	);
	const hasHierarchyAccess = useHasAnyPermission(
		RESOURCES.IDENTITY_HIERARCHY_LEVEL,
		[ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		contextScope,
	);

	const items: MenuBarItem[] = [];

	items.push({
		label: 'Overview',
		link: '/overview',
	});

	const usersItems: MenuBarItem[] = [];
	if (hasUserAccess) {
		usersItems.push({ label: 'Users', link: '/users' });
	}
	if (hasGroupAccess) {
		usersItems.push({ label: 'Groups', link: '/groups' });
	}
	if (usersItems.length > 0) {
		items.push({ label: 'Users', items: usersItems });
	}

	const orgItems: MenuBarItem[] = [];
	if (hasOrgAccess) {
		orgItems.push({ label: 'Organizations', link: '/organizations' });
	}
	if (hasHierarchyAccess) {
		orgItems.push({ label: 'Hierarchy Levels', link: '/hierarchy-levels' });
	}
	if (orgItems.length > 0) {
		items.push({ label: 'Organizations', items: orgItems });
	}

	return items;
}
