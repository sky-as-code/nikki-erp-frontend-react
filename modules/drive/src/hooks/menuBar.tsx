import { MenuBarItem } from '@nikkierp/ui/appState';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


export function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();

	return useMemo(
		() => [
			{
				label: translate('nikki.drive.menu.overview', 'Overview'),
				link: '/overview',
			},
			{
				label: translate('nikki.drive.menu.management', 'Management'),
				items: [
					{
						label: translate('nikki.drive.menu.my-files', 'My Files'),
						link: '/management/my-files',
					},
					{
						label: translate('nikki.drive.menu.trash', 'Trash'),
						link: '/management/trash',
					},
				],
			},
		],
		[translate],
	);
}
