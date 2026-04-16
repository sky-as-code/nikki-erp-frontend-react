import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { KioskModel } from '@/features/kioskModels/types';


export const useKioskModelDetailBreadcrumbs = ({ model }: { model?: KioskModel }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();
	const pathname = useLocation().pathname;
	const id = pathname.split('/').pop() ?? '';

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskModels.title'), href: '../kiosk-models' },
		{ title: model ? model.name || translate('nikki.vendingMachine.kioskModels.detail.title') : id, href: '#' },
	], [model, id, translate]);
};
