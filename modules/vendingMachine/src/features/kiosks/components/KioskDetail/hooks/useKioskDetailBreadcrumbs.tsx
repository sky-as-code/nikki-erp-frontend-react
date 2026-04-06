import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { Kiosk } from '@/features/kiosks';


export const useKioskDetailBreadcrumbs = ({ kiosk }: { kiosk?: Kiosk }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('nikki.vendingMachine.kiosk.detail.title'), href: '#' },
	], [kiosk?.name, translate]);
};
