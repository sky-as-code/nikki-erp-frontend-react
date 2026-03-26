import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { PageContainerProps } from '@/components/PageContainer';

import { type KioskModel } from '../../../types';
import { KioskModelBasicInfo } from '../KioskModelBasicInfo';
import { KioskModelSettings } from '../KioskModelSettings';


type TabHookReturn = {
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: unknown[]) => void>;
	state: Record<string, unknown>;
	getComponentProps?: () => Record<string, unknown>;
};

const useBasicInfoTab = (_model?: KioskModel): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);
	const handleDelete = useCallback(() => {
		// TODO: Implement delete logic
	}, []);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			variant: 'filled' as const,
		}] : [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			variant: 'filled' as const,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
		}]),
		{
			label: translate('nikki.general.actions.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: handleDelete,
			variant: 'outline' as const,
			color: 'red' as const,
		},
	], [isEditing, handleEdit, handleSave, handleCancel, handleDelete, translate]);

	return {
		actions,
		handlers: { handleEdit, handleSave, handleCancel, handleDelete },
		state: { isEditing },
		getComponentProps: () => ({ isEditing }),
	};
};

const useModelSettingsTab = (_model?: KioskModel): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			variant: 'filled' as const,
		}] : [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			variant: 'filled' as const,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
		}]),
	], [isEditing, handleEdit, handleSave, handleCancel, translate]);

	return {
		actions,
		handlers: { handleEdit, handleSave, handleCancel },
		state: { isEditing },
		getComponentProps: () => ({ isEditing }),
	};
};

export type TabId = 'basicInfo' | 'modelSettings';

export type UseKioskModelDetailTabsProps = {
	model?: KioskModel;
	activeTab: TabId;
};

export type UseKioskModelDetailTabsReturn = {
	tabs: DetailLayoutProps['tabs'];
	getTabActions: (tabId: TabId) => ControlPanelProps['actions'];
};

const createTabComponent = (
	tabId: TabId,
	componentProps: Record<string, unknown>,
): React.ReactNode => {
	switch (tabId) {
		case 'basicInfo':
			return <KioskModelBasicInfo key='basicInfo' model={componentProps?.model as KioskModel} />;
		case 'modelSettings':
			return <KioskModelSettings key='modelSettings' model={componentProps?.model as KioskModel} isEditing={componentProps?.isEditing as boolean} />;
		default:
			return null;
	}
};

export const useKioskModelDetailTabs = ({
	model,
	activeTab,
}: UseKioskModelDetailTabsProps): UseKioskModelDetailTabsReturn => {
	const { t: translate } = useTranslation();

	const basicInfoTab = useBasicInfoTab(model);
	const modelSettingsTab = useModelSettingsTab(model);

	const tabHooks = useMemo<Record<TabId, TabHookReturn>>(() => ({
		basicInfo: basicInfoTab,
		modelSettings: modelSettingsTab,
	}), [basicInfoTab, modelSettingsTab]);

	const tabs = useMemo<DetailLayoutProps['tabs']>(() => {
		if (!model) return [];

		const tabConfigs: Array<{ id: TabId; title: string }> = [
			{ id: 'basicInfo', title: translate('nikki.vendingMachine.kioskModels.tabs.basicInfo') },
			{ id: 'modelSettings', title: translate('nikki.vendingMachine.kioskModels.tabs.modelSettings') },
		];

		return tabConfigs.map((config) => {
			const tabHook = tabHooks[config.id];
			const componentProps = tabHook.getComponentProps?.() ?? {};
			return {
				id: config.id,
				title: config.title,
				content: () => {
					if (config.id !== activeTab) return null;
					return createTabComponent(config.id, { model, ...componentProps });
				},
			};
		});
	}, [model, activeTab, translate, tabHooks]);

	const getTabActions = useCallback((tabId: TabId): ControlPanelProps['actions'] => {
		return tabHooks[tabId]?.actions ?? [];
	}, [tabHooks]);

	return {
		tabs,
		getTabActions,
	};
};

export const useKioskModelDetailBreadcrumbs = ({ model }: { model?: KioskModel }): PageContainerProps['breadcrumbs'] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskModels.title'), href: '../kiosk-models' },
		{ title: model?.name || translate('nikki.vendingMachine.kioskModels.detail.title'), href: '#' },
	], [model?.name, translate]);
};
