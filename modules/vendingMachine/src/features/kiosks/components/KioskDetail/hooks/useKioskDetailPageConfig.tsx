import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '@/components/ControlPanel';
import { useKioskDetailTabControl } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import { Kiosk } from '@/features/kiosks/types';

import { KioskActivity } from '../KioskActivity';
import { KioskBasicInfo } from '../KioskBasicInfo';
import { KioskDetailSettings } from '../KioskDetailSettings';
import { ProductGridView } from '../ProductGridView';
import { ProductListView } from '../ProductListView';
import { useKioskDetailBreadcrumbs } from './useKioskDetailBreadcrumbs';

import type { KioskDetailTabId, UseKioskDetailPageConfigProps, UseKioskDetailPageConfigReturn } from './types';



type DetailTabConfig = {
	id: KioskDetailTabId;
	title: string;
	content: () => React.ReactNode;
};

const useKioskDetailTabs = ({kiosk}: {kiosk?: Kiosk}): Array<DetailTabConfig> => {
	const {t: translate} = useTranslation();
	const tabs = useMemo<Array<DetailTabConfig>>(() => {
		if (!kiosk) {
			return [];
		}
		return [
			{
				id: 'basicInfo',
				title: translate('nikki.vendingMachine.kiosk.tabs.basicInfo'),
				content: () => <KioskBasicInfo key={'basicInfo'} kiosk={kiosk} />,
			},
			{
				id: 'kioskSetting',
				title: translate('nikki.vendingMachine.kiosk.tabs.kioskSetting'),
				content: () => <KioskDetailSettings key={'kioskSetting'} kiosk={kiosk} />,
			},
			{
				id: 'productsList',
				title: translate('nikki.vendingMachine.kiosk.tabs.productsList'),
				content: () => <ProductListView key={'productsList'} kiosk={kiosk}/>,
			},
			{
				id: 'productsGrid',
				title: translate('nikki.vendingMachine.kiosk.tabs.productsGrid'),
				content: () => <ProductGridView key={'productsGrid'} kiosk={kiosk} />,
			},
			{
				id: 'activity',
				title: translate('nikki.vendingMachine.kiosk.tabs.activity'),
				content: () => <KioskActivity key={'activity'} />,
			},
		];
	}, [kiosk]);

	return tabs;
};

const useTabActions = ({activeTab}: {activeTab: KioskDetailTabId}): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { registry } = useKioskDetailTabControl();

	const actions = useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosks'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];

		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);

	return actions;
};


export const useKioskDetailPageConfig = ({kiosk}: UseKioskDetailPageConfigProps): UseKioskDetailPageConfigReturn => {
	const [activeTab, setActiveTab] = useState<KioskDetailTabId>('basicInfo');
	const onTabChange = useCallback((tab: string) => setActiveTab(tab as KioskDetailTabId), []);

	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });
	const tabs = useKioskDetailTabs({ kiosk });
	const actions = useTabActions({ activeTab });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		tabs,
		activeTab,
		onTabChange,
	}), [breadcrumbs, actions, tabs, activeTab, onTabChange]);
};
