
import { ACTIONS, RESOURCES, useHasAnyPermission, PermissionScopeType } from '@nikkierp/shell/userContext';
import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';
import { useTranslation } from 'react-i18next';


type ContextScope = { scopeType: PermissionScopeType; scopeRef: string };

function filterMenuByPermissions(
	configs: MenuBarItem[],
	contextScope?: ContextScope,
): MenuBarItem[] {
	const result: MenuBarItem[] = [];

	for (const config of configs) {
		const hasAccess = useHasAnyPermission(config.resource!, config.actions, contextScope);

		if (hasAccess) {
			const item: MenuBarItem = {
				label: config.label,
				link: config.link,
			};

			if (config.items && config.items.length > 0) {
				const MenuBarItems = filterMenuByPermissions(config.items, contextScope);
				if (MenuBarItems.length > 0) {
					item.items = MenuBarItems;
				}
			}

			result.push(item);
		}
	}

	return result;
}


export function useMenuBarItems(contextScope?: ContextScope): MenuBarItem[] {
	const { t: translate } = useTranslation();

	const menuBarConfig: MenuBarItem[] = [
		{
			label: translate('nikki.identity.menu.users'),
			link: '/users',
			resource: RESOURCES.IDENTITY_USER,
			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		},
		{
			label: translate('nikki.identity.menu.groups'),
			link: '/groups',
			resource: RESOURCES.IDENTITY_GROUP,
			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		},
		{
			label: translate('nikki.identity.menu.organizations'),
			link: '/organizations',
			resource: RESOURCES.IDENTITY_ORGANIZATION,
			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		},
		{
			label: translate('nikki.identity.menu.hierarchyLevels'),
			link: '/hierarchy-levels',
			resource: RESOURCES.IDENTITY_HIERARCHY_LEVEL,
			actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
		},
	];

	const items: MenuBarItem[] = [];

	items.push({
		label: translate('nikki.identity.menu.overview'),
		link: '/overview',
	});

	items.push(...filterMenuByPermissions(menuBarConfig, contextScope));

	return items;
}
