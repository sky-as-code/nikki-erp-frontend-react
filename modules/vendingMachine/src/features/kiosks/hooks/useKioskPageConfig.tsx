import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { kioskActions, VendingMachineDispatch } from '@/appState';
import { BreadcrumbItem } from '@/components/BreadCrumbs';

import { KioskListViewMode } from '../components';

import type { ControlPanelActionItem } from '@/components/ControlPanel';



export interface UseKioskPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelActionItem[];
	viewMode: KioskListViewMode;
	setViewMode: (mode: KioskListViewMode) => void;
}

export const useKioskPageConfig = ()
: UseKioskPageConfigReturn => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const [viewMode, setViewMode] = useState<KioskListViewMode>('list');
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const handleRefresh = () => dispatch(kioskActions.listKiosks());

	const handleCreate = () => {
		navigate('../kiosks/create');
	};

	const breadcrumbs = useMemo(() => {
		return [
			{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
			{ title: translate('nikki.vendingMachine.kiosk.title'), href: '#' },
		];
	}, [translate]);

	const actions = useMemo(() => [
		{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
		{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' as const },
	], [handleRefresh, translate]);


	return {
		breadcrumbs,
		actions,
		viewMode,
		setViewMode,
	};
};
