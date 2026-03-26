import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContainerProps } from '@/components/PageContainer';
import { Kiosk } from '@/features/kiosks';


export const useKioskDetailBreadcrumbs = ({ kiosk }: { kiosk?: Kiosk }): PageContainerProps['breadcrumbs'] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('nikki.vendingMachine.kiosk.detail.title'), href: '#' },
	], [kiosk?.name, translate]);
};
