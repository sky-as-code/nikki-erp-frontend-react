import { IconArrowLeft } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '@/components/ControlPanel';

import { KioskSetting } from '../../../types';
import { KioskSettingDetailBasicInfo } from '../KioskSettingDetailBasicInfo';
import { KioskSettingDetailKiosks } from '../KioskSettingDetailKiosks';
import { KioskSettingDetailSettings } from '../KioskSettingDetailSettings';
import { useKioskSettingDetailBreadcrumbs } from './useKioskSettingDetailBreadcrumbs';
import { useKioskSettingDetailTabControl } from '../kioskSettingDetailTabControl';

import type {
	KioskSettingDetailTabId,
	UseKioskSettingDetailPageConfigProps,
	UseKioskSettingDetailPageConfigReturn,
} from './types';



type DetailTabConfig = {
	id: KioskSettingDetailTabId;
	title: string;
	content: () => React.ReactNode;
};

const useKioskSettingDetailTabs = ({ setting }: { setting?: KioskSetting }): Array<DetailTabConfig> => {
	const { t: translate } = useTranslation();

	return useMemo<Array<DetailTabConfig>>(() => {
		if (!setting) {
			return [];
		}
		return [
			{
				id: 'basicInfo',
				title: translate('nikki.vendingMachine.kioskSettings.tabs.basicInfo'),
				content: () => <KioskSettingDetailBasicInfo key='basicInfo' setting={setting} />,
			},
			{
				id: 'settings',
				title: translate('nikki.vendingMachine.kioskSettings.tabs.settings'),
				content: () => <KioskSettingDetailSettings key='settings' setting={setting} />,
			},
			{
				id: 'kiosks',
				title: translate('nikki.vendingMachine.kioskSettings.tabs.kiosks'),
				content: () => <KioskSettingDetailKiosks key='kiosks' setting={setting} />,
			},
		];
	}, [setting, translate]);
};

const useTabActions = ({ activeTab }: { activeTab: KioskSettingDetailTabId }): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { registry } = useKioskSettingDetailTabControl();

	const actions = useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosk-settings'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];

		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);

	return actions;
};

export function useKioskSettingDetailPageConfig({ setting }:
UseKioskSettingDetailPageConfigProps): UseKioskSettingDetailPageConfigReturn {
	const [activeTab, setActiveTab] = useState<KioskSettingDetailTabId>('basicInfo');
	const onTabChange = useCallback((tab: string) => setActiveTab(tab as KioskSettingDetailTabId), []);

	const breadcrumbs = useKioskSettingDetailBreadcrumbs({ setting });
	const tabs = useKioskSettingDetailTabs({ setting });
	const actions = useTabActions({ activeTab });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		tabs,
		activeTab,
		onTabChange,
	}), [breadcrumbs, actions, tabs, activeTab, onTabChange]);
}
