import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';
import { useTranslation } from 'react-i18next';


// eslint-disable-next-line max-lines-per-function
export function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();

	const items: MenuBarItem[] = [];

	items.push({
		label: translate('nikki.authorize.menu.overview'),
		link: '/overview',
	});

	const resourcesActionsItems: MenuBarItem[] = [
		{
			label: translate('nikki.authorize.menu.resources'),
			link: '/resources',
		},
		{
			label: translate('nikki.authorize.menu.actions'),
			link: '/actions',
		},
		{
			label: translate('nikki.authorize.menu.entitlements'),
			link: '/entitlements',
		},
	];
	items.push({
		label: translate('nikki.authorize.menu.resources_actions'),
		items: resourcesActionsItems,
	});

	const rolesItems: MenuBarItem[] = [
		{
			label: translate('nikki.authorize.menu.roles'),
			link: '/roles',
		},
		{
			label: translate('nikki.authorize.menu.role_suites'),
			link: '/role-suites',
		},
	];
	items.push({
		label: translate('nikki.authorize.menu.roles'),
		items: rolesItems,
	});

	const requestsItems: MenuBarItem[] = [
		{
			label: translate('nikki.authorize.menu.grant_requests'),
			link: '/grant-requests',
		},
		{
			label: translate('nikki.authorize.menu.revoke_requests'),
			link: '/revoke-requests',
		},
	];
	items.push({
		label: translate('nikki.authorize.menu.requests'),
		items: requestsItems,
	});

	return items;
}