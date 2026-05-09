import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';
import { useTranslation } from 'react-i18next';


export function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();

	const items: MenuBarItem[] = [
		{
			label: translate('nikki.identity.menu.overview'),
			link: '/overview',
		},
		{
			label: translate('nikki.identity.menu.users'),
			link: '/users',
		},
		{
			label: translate('nikki.identity.menu.groups'),
			link: '/groups',
		},
		{
			label: translate('nikki.identity.menu.organizations'),
			link: '/organizations',
		},
		{
			label: translate('nikki.identity.menu.hierarchyLevels'),
			link: '/hierarchy-levels',
		},
	];

	return items;
}
