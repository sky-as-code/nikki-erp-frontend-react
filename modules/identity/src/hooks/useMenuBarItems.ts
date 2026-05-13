import { MenuBarItem } from '@nikkierp/ui/appState/layoutSlice';
import { useTranslate } from '@nikkierp/ui/i18n';


export function useIdentityMenuBarItems(): MenuBarItem[] {
	const t = useTranslate('identity');

	const items: MenuBarItem[] = [
		{
			label: t('menu.overview'),
			link: '/overview',
		},
		{
			label: t('menu.users'),
			items: [
				{
					label: t('menu.users'),
					link: '/users',
				},
				{
					label: t('menu.groups'),
					link: '/groups',
				},
			],
		},
		{
			label: t('menu.organizations'),
			items: [
				{
					label: t('menu.organizations'),
					link: '/organizations',
				},
				{
					label: t('menu.organizationalUnits'),
					link: '/org-units',
				},
			],
		},
	];

	return items;
}
