
// import { ACTIONS, RESOURCES, useHasAnyPermission, PermissionScopeType } from '@nikkierp/shell/userContext';
// import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';
// import { useTranslation } from 'react-i18next';


// type ContextScope = { scopeType: PermissionScopeType; scopeRef: string };

// export function useMenuBarItems(contextScope?: ContextScope): MenuBarItem[] {
// 	const { t: translate } = useTranslation();

// 	const items: MenuBarItem[] = [
// 		{
// 			label: translate('nikki.identity.menu.overview'),
// 			link: '/overview',
// 		},
// 		{
// 			label: translate('nikki.identity.menu.users'),
// 			link: '/users',
// 			resource: RESOURCES.IDENTITY_USER,
// 			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
// 		},
// 		{
// 			label: translate('nikki.identity.menu.groups'),
// 			link: '/groups',
// 			resource: RESOURCES.IDENTITY_GROUP,
// 			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
// 		},
// 		{
// 			label: translate('nikki.identity.menu.organizations'),
// 			link: '/organizations',
// 			resource: RESOURCES.IDENTITY_ORGANIZATION,
// 			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
// 		},
// 		{
// 			label: translate('nikki.identity.menu.hierarchyLevels'),
// 			link: '/hierarchy-levels',
// 			resource: RESOURCES.IDENTITY_HIERARCHY_LEVEL,
// 			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
// 		},
// 	];

// 	return items;
// }
