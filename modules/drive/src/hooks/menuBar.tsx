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
		],
		[translate],
	);
}
