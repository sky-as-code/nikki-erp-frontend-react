import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { KioskDevice } from '@/features/kioskDevices/types';


export const useKioskDeviceDetailBreadcrumbs = ({ kioskDevice }: { kioskDevice?: KioskDevice }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.device'), href: '../kiosk-devices' },
		{ title: kioskDevice?.name || translate('nikki.vendingMachine.device.detail.title'), href: '#' },
	], [kioskDevice?.name, translate]);
};
