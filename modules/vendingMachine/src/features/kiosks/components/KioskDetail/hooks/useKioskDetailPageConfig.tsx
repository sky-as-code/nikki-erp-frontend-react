import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem, ControlPanelProps } from '@/components/ControlPanel';

import { useKioskDetailTabControl } from './KioskDetailTabControlContext';
import { KioskActivity } from '../KioskActivity';
import { KioskBasicInfo } from '../KioskBasicInfo';
import { KioskSetting } from '../KioskSetting';
import { ProductGridView } from '../ProductGridView';
import { ProductListView } from '../ProductListView';
import { useKioskDetailBreadcrumbs } from './useKioskDetailBreadcrumbs';

import type { TabId, UseKioskDetailPageConfigProps, UseKioskDetailPageConfigReturn } from './types';



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
	const { registry } = useKioskDetailTabControl();

	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });

	const tabs = useMemo<Array<DetailTabConfig>>(() => {
		if (!kiosk) {
			return [];
		}
		return [
			{
				id: 'basicInfo',
				title: translate('nikki.vendingMachine.kiosk.tabs.basicInfo'),
				content: () => (
					<KioskBasicInfo
						key={'basicInfo'}
						kiosk={kiosk}
						onOpenDeleteKiosk={onOpenDeleteKiosk}
					/>
				),
			},
			{
				id: 'kioskSetting',
				title: translate('nikki.vendingMachine.kiosk.tabs.kioskSetting'),
				content: () => <KioskSetting key={'kioskSetting'} kiosk={kiosk} />,
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
	}, [kiosk, translate, onOpenDeleteKiosk]);


	const commonActions = useMemo<ControlPanelActionItem[]>(() => {
		return [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosks'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
	}, [translate, navigate]);

	const getTabActions = useCallback((tabId: TabId): ControlPanelProps['actions'] => {
		return [...(commonActions ?? []), ...(registry[tabId]?.actions ?? [])];
	}, [registry]);

	return {
		breadcrumbs: breadcrumbs ?? [],
		actions: getTabActions(activeTab) ?? [],
		tabs: tabs ?? [],
	};
};

