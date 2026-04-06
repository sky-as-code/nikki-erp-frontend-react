import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { Setting } from '@/features/settings/types';


export const useSettingDetailBreadcrumbs = ({ setting }: { setting?: Setting }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.settings.title'), href: '../settings' },
		{ title: setting?.name || translate('nikki.vendingMachine.settings.detail.title'), href: '#' },
	], [setting?.name, translate]);
};
