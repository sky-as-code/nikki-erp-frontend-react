import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '@/components/ControlPanel';
import { useKioskModelDetailTabControl } from '@/features/kioskModels/components/KioskModelDetail/kioskModelDetailTabControl';
import { KioskModel } from '@/features/kioskModels/types';

import { KioskModelBasicInfo } from '../KioskModelBasicInfo';
import { KioskModelSettings } from '../KioskModelSettings';
import { useKioskModelDetailBreadcrumbs } from './useKioskModelDetailBreadcrumbs';

import type { KioskModelDetailTabId, UseKioskModelDetailPageConfigProps, UseKioskModelDetailPageConfigReturn } from './types';


type DetailTabConfig = {
	id: KioskModelDetailTabId;
	title: string;
	content: () => React.ReactNode;
};

const useKioskModelDetailTabs = ({ model }: { model?: KioskModel }): Array<DetailTabConfig> => {
	const { t: translate } = useTranslation();
	const tabs = useMemo<Array<DetailTabConfig>>(() => {
		if (!model) return [];
		return [
			{
				id: 'basicInfo',
				title: translate('nikki.vendingMachine.kioskModels.tabs.basicInfo'),
				content: () => <KioskModelBasicInfo key='basicInfo' model={model} />,
			},
			{
				id: 'modelSettings',
				title: translate('nikki.vendingMachine.kioskModels.tabs.modelSettings'),
				content: () => <KioskModelSettings key='modelSettings' model={model} />,
			},
		];
	}, [model]);

	return tabs;
};

const useTabActions = ({ activeTab }: { activeTab: KioskModelDetailTabId }): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { registry } = useKioskModelDetailTabControl();

	const actions = useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosk-models'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];

		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);

	return actions;
};


export const useKioskModelDetailPageConfig = ({ model }: UseKioskModelDetailPageConfigProps): UseKioskModelDetailPageConfigReturn => {
	const [activeTab, setActiveTab] = useState<KioskModelDetailTabId>('basicInfo');
	const onTabChange = useCallback((tab: string) => setActiveTab(tab as KioskModelDetailTabId), []);

	const breadcrumbs = useKioskModelDetailBreadcrumbs({ model });
	const tabs = useKioskModelDetailTabs({ model });
	const actions = useTabActions({ activeTab });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		tabs,
		activeTab,
		onTabChange,
	}), [breadcrumbs, actions, tabs, activeTab, onTabChange]);
};
