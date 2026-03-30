import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem, ControlPanelProps } from '@/components/ControlPanel';

import { useActivityTab } from './useActivityTab';
import { useBasicInfoTab } from './useBasicInfoTab';
import { useKioskSettingTab } from './useKioskSettingTab';
import { useProductsGridTab } from './useProductsGridTab';
import { useProductsListTab } from './useProductsListTab';
import { KioskActivity } from '../KioskActivity';
import { KioskBasicInfo } from '../KioskBasicInfo';
import { KioskSetting } from '../KioskSetting';
import { ProductGridView } from '../ProductGridView';
import { ProductListView } from '../ProductListView';
import { useKioskDetailBreadcrumbs } from './useKioskDetailBreadcrumbs';

import type { TabHookReturn, TabId, UseKioskDetailPageConfigProps, UseKioskDetailPageConfigReturn } from './types';



type DetailTabConfig = {
	id: TabId;
	title: string;
	content: () => React.ReactNode;
};

export const useKioskDetailPageConfig = ({
	kiosk,
	activeTab,
	onOpenDeleteKiosk,
}: UseKioskDetailPageConfigProps): UseKioskDetailPageConfigReturn => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });

	const basicInfoTab = useBasicInfoTab(kiosk, onOpenDeleteKiosk);
	const kioskSettingTab = useKioskSettingTab(kiosk);
	const productsListTab = useProductsListTab(kiosk);
	const productsGridTab = useProductsGridTab(kiosk);
	const activityTab = useActivityTab(kiosk);

	const tabHooks = useMemo<Record<TabId, TabHookReturn>>(() => {
		return {
			basicInfo: basicInfoTab,
			kioskSetting: kioskSettingTab,
			productsList: productsListTab,
			productsGrid: productsGridTab,
			activity: activityTab,
		};
	}, [basicInfoTab, kioskSettingTab, productsListTab, productsGridTab, activityTab]);

	const tabs: Array<DetailTabConfig> = kiosk ? [
		{
			id: 'basicInfo',
			title: translate('nikki.vendingMachine.kiosk.tabs.basicInfo'),
			content: () => <KioskBasicInfo key={'basicInfo'} kiosk={kiosk} tabState={basicInfoTab.state}/>,
		},
		{
			id: 'kioskSetting',
			title: translate('nikki.vendingMachine.kiosk.tabs.kioskSetting'),
			content: () => <KioskSetting key={'kioskSetting'} kiosk={kiosk} tabState={kioskSettingTab.state} />,
		},
		{
			id: 'productsList',
			title: translate('nikki.vendingMachine.kiosk.tabs.productsList'),
			content: () => <ProductListView key={'productsList'} kiosk={kiosk}/>,
		},
		{
			id: 'productsGrid',
			title: translate('nikki.vendingMachine.kiosk.tabs.productsGrid'),
			content: () => <ProductGridView key={'productsGrid'} kiosk={kiosk} tabState={productsGridTab.state} />,
		},
		{
			id: 'activity',
			title: translate('nikki.vendingMachine.kiosk.tabs.activity'),
			content: () => <KioskActivity key={'activity'} />,
		},
	] : [];


	const commonActions = useMemo<ControlPanelActionItem[]>(() => {
		return [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosks'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
	}, [translate, navigate]);

	const getTabActions = useCallback((tabId: TabId): ControlPanelProps['actions'] => {
		const tabActions = tabHooks[tabId]?.actions ?? [];
		return kiosk ? [...commonActions, ...tabActions] : tabActions;
	}, [tabHooks, kiosk, commonActions]);

	const getTabHandlers = useCallback((tabId: TabId): Record<string, (...args: any[]) => void> => {
		return tabHooks[tabId]?.handlers ?? {};
	}, [tabHooks]);

	const getTabState = useCallback((tabId: TabId): Record<string, any> => {
		return tabHooks[tabId]?.state ?? {};
	}, [tabHooks]);

	return {
		breadcrumbs: breadcrumbs ?? [],
		tabs: tabs ?? [],
		tabState: getTabState(activeTab) ?? {},
		actions: getTabActions(activeTab) ?? [],
		handlers: getTabHandlers(activeTab) ?? {},
		getTabState,
		getTabActions,
		getTabHandlers,
	};
};
