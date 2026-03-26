import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskSettingActions } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { PageContainerProps } from '@/components/PageContainer';
import { Game } from '@/features/games/types';
import { Kiosk } from '@/features/kiosks/types';
import { Slideshow } from '@/features/slideshow/types';
import { Theme } from '@/features/themes/types';

import { KioskSetting } from '../../../types';
import { KioskSettingDetailBasicInfo } from '../KioskSettingDetailBasicInfo';
import { KioskSettingDetailKiosks, type KioskSettingDetailKiosksProps } from '../KioskSettingDetailKiosks';
import { KioskSettingDetailSettings, type KioskSettingDetailSettingsProps } from '../KioskSettingDetailSettings';


export type KioskSettingUpdatePayload = Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>>;

type TabHookReturn = {
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: any[]) => void>;
	state: Record<string, unknown>;
	getComponentProps?: () => Record<string, unknown>;
};

type UseBasicInfoTabArgs = {
	onSaveBasicInfo?: () => void | Promise<void>;
	onDelete?: () => void | Promise<void>;
};

const useBasicInfoTab = ({ onSaveBasicInfo, onDelete }: UseBasicInfoTabArgs): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(async () => {
		await onSaveBasicInfo?.();
		setIsEditing(false);
	}, [onSaveBasicInfo]);
	const handleCancel = useCallback(() => setIsEditing(false), []);
	const handleDelete = useCallback(async () => {
		await onDelete?.();
	}, [onDelete]);

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

type UseSettingsTabArgs = {
	setting?: KioskSetting;
	onSaveSettings?: (updates: KioskSettingUpdatePayload) => void | Promise<void>;
};

const useSettingsTab = ({ setting, onSaveSettings }: UseSettingsTabArgs): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [draftTheme, setDraftTheme] = useState<Theme | undefined>(undefined);
	const [draftGame, setDraftGame] = useState<Game | undefined>(undefined);
	const [idlePlaylist, setIdlePlaylist] = useState<Slideshow | undefined>(undefined);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Slideshow | undefined>(undefined);

	const resetDraftFromSetting = useCallback(() => {
		if (!setting) return;
		setDraftTheme(setting.theme);
		setDraftGame(setting.game);
		setIdlePlaylist(setting.idlePlaylist);
		setShoppingPlaylist(setting.shoppingPlaylist);
	}, [setting]);

	useEffect(() => {
		resetDraftFromSetting();
	}, [setting?.id, setting?.etag, resetDraftFromSetting]);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(async () => {
		if (!setting) return;
		await onSaveSettings?.({
			themeId: draftTheme?.id,
			theme: draftTheme,
			gameId: draftGame?.id,
			game: draftGame,
			idlePlaylist,
			shoppingPlaylist,
		});
		setIsEditing(false);
	}, [setting, onSaveSettings, draftTheme, draftGame, idlePlaylist, shoppingPlaylist]);
	const handleCancel = useCallback(() => {
		resetDraftFromSetting();
		setIsEditing(false);
	}, [resetDraftFromSetting]);

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
		getComponentProps: () => ({
			isEditing,
			settingTheme: draftTheme,
			settingGame: draftGame,
			idlePlaylist,
			shoppingPlaylist,
			onThemeChange: setDraftTheme,
			onThemeRemove: () => setDraftTheme(undefined),
			onGameChange: setDraftGame,
			onGameRemove: () => setDraftGame(undefined),
			onIdlePlaylistChange: setIdlePlaylist,
			onShoppingPlaylistChange: setShoppingPlaylist,
			onIdlePlaylistRemove: () => setIdlePlaylist(undefined),
			onShoppingPlaylistRemove: () => setShoppingPlaylist(undefined),
		}),
	};
};

type UseKiosksTabArgs = {
	setting?: KioskSetting;
};

const useKiosksTab = ({ setting }: UseKiosksTabArgs): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [draftKiosks, setDraftKiosks] = useState<Kiosk[]>([]);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);

	const resetDraftFromSetting = useCallback(() => {
		if (!setting) return;
		setDraftKiosks(setting.kiosks ?? []);
	}, [setting]);

	useEffect(() => {
		resetDraftFromSetting();
	}, [setting?.id, setting?.etag, resetDraftFromSetting]);

	const handleEdit = useCallback(() => setIsEditing(true), []);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const handleSave = useCallback(async () => {
		if (!setting?.id || !setting?.etag) return;
		dispatch(kioskSettingActions.updateKioskSetting({
			id: setting.id,
			etag: setting.etag,
			updates: { kiosks: draftKiosks },
		}));
		setIsEditing(false);
	}, [dispatch, setting, draftKiosks]);

	const handleCancel = useCallback(() => {
		resetDraftFromSetting();
		setIsEditing(false);
	}, [resetDraftFromSetting]);

	const handleRemoveKiosk = useCallback((kioskId: string) => {
		setDraftKiosks((prev) => prev.filter((k) => k.id !== kioskId));
	}, []);

	const handleAddKiosksFromModal = useCallback((kiosks: Kiosk[]) => {
		setDraftKiosks((prev) => [...prev, ...kiosks]);
	}, []);

	const handleOpenAddKiosks = useCallback(() => {
		setKioskSelectModalOpened(true);
	}, []);

	const handleCloseAddKiosks = useCallback(() => {
		setKioskSelectModalOpened(false);
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
	], [isEditing, handleEdit, handleSave, handleCancel, translate]);

	return {
		actions,
		handlers: {
			handleEdit,
			handleSave,
			handleCancel,
		},
		state: { isEditing, kiosks: draftKiosks },
		getComponentProps: () => ({
			isEditing,
			kiosks: draftKiosks,
			onAddKiosks: handleOpenAddKiosks,
			onRemoveKiosk: handleRemoveKiosk,
			kioskSelectModalOpened,
			onCloseKioskSelectModal: handleCloseAddKiosks,
			onSelectKiosks: handleAddKiosksFromModal,
		}),
	};
};


export type KioskSettingDetailTabId = 'basicInfo' | 'settings' | 'kiosks';

export type UseKioskSettingDetailTabsProps = {
	setting?: KioskSetting;
	activeTab: KioskSettingDetailTabId;
};

export type KioskSelectModalPropsForSettingDetail = {
	opened: boolean;
	onClose: () => void;
	onSelectKiosks: (kiosks: Kiosk[]) => void;
	selectedKioskIds: string[];
};

export type UseKioskSettingDetailTabsReturn = {
	tabs: DetailLayoutProps['tabs'];
	getTabActions: (tabId: KioskSettingDetailTabId) => ControlPanelProps['actions'];
	getTabHandlers: (tabId: KioskSettingDetailTabId) => Record<string, (...args: any[]) => void>;
	getTabState: (tabId: KioskSettingDetailTabId) => Record<string, unknown>;
};

type CreateTabProps = {
	setting: KioskSetting;
} & Record<string, unknown>;

const createTabComponent = (tabId: KioskSettingDetailTabId, props: CreateTabProps): React.ReactNode => {
	const { setting, ...rest } = props;

	switch (tabId) {
		case 'basicInfo':
			return (
				<KioskSettingDetailBasicInfo
					key='basicInfo'
					setting={setting}
					isEditing={Boolean(rest.isEditing)}
				/>
			);
		case 'settings':
			return (
				<KioskSettingDetailSettings
					key='settings'
					setting={setting}
					{...(rest as Omit<KioskSettingDetailSettingsProps, 'setting'>)}
				/>
			);
		case 'kiosks':
			return (
				<KioskSettingDetailKiosks
					key='kiosks'
					{...(rest as KioskSettingDetailKiosksProps)}
				/>
			);
		default:
			return null;
	}
};

function useKioskSettingDetailTabRegistry(
	tabHooks: Record<KioskSettingDetailTabId, TabHookReturn>,
): Pick<UseKioskSettingDetailTabsReturn, 'getTabActions' | 'getTabHandlers' | 'getTabState'> {
	const getTabActions = useCallback((tabId: KioskSettingDetailTabId): ControlPanelProps['actions'] => {
		return tabHooks[tabId]?.actions ?? [];
	}, [tabHooks]);

	const getTabHandlers = useCallback((tabId: KioskSettingDetailTabId) => {
		return tabHooks[tabId]?.handlers ?? {};
	}, [tabHooks]);

	const getTabState = useCallback((tabId: KioskSettingDetailTabId) => {
		return tabHooks[tabId]?.state ?? {};
	}, [tabHooks]);

	return { getTabActions, getTabHandlers, getTabState };
}

function useKioskSettingDetailPersistence(setting: KioskSetting | undefined) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const navigate = useNavigate();

	const refreshDetail = useCallback(() => {
		if (setting?.id) {
			dispatch(kioskSettingActions.getKioskSetting(setting.id));
		}
	}, [dispatch, setting?.id]);

	const onSaveSettings = useCallback(async (updates: KioskSettingUpdatePayload) => {
		if (!setting) return;
		await dispatch(kioskSettingActions.updateKioskSetting({
			id: setting.id,
			etag: setting.etag,
			updates,
		})).unwrap();
		refreshDetail();
	}, [dispatch, setting, refreshDetail]);

	const onDelete = useCallback(async () => {
		if (!setting) return;
		await dispatch(kioskSettingActions.deleteKioskSetting({ id: setting.id })).unwrap();
		navigate('../kiosk-settings');
	}, [dispatch, navigate, setting]);


	return {
		onSaveSettings,
		onDelete,
	};
}

export const useKioskSettingDetailTabs = ({
	setting,
	activeTab,
}: UseKioskSettingDetailTabsProps): UseKioskSettingDetailTabsReturn => {
	const { t: translate } = useTranslation();
	const {
		onSaveSettings,
		onDelete,
	} = useKioskSettingDetailPersistence(setting);

	const basicInfoTab = useBasicInfoTab({ onDelete });
	const settingsTab = useSettingsTab({ setting, onSaveSettings });
	const kiosksTab = useKiosksTab({ setting });

	const tabHooks = useMemo<Record<KioskSettingDetailTabId, TabHookReturn>>(() => ({
		basicInfo: basicInfoTab,
		settings: settingsTab,
		kiosks: kiosksTab,
	}), [basicInfoTab, settingsTab, kiosksTab]);

	const tabs = useMemo<DetailLayoutProps['tabs']>(() => {
		if (!setting) return [];

		const tabConfigs: Array<{ id: KioskSettingDetailTabId; title: string }> = [
			{ id: 'basicInfo', title: translate('nikki.vendingMachine.kioskSettings.tabs.basicInfo') },
			{ id: 'settings', title: translate('nikki.vendingMachine.kioskSettings.tabs.settings') },
			{ id: 'kiosks', title: translate('nikki.vendingMachine.kioskSettings.tabs.kiosks') },
		];

		return tabConfigs.map((config) => {
			const tabHook = tabHooks[config.id];
			const componentProps = tabHook.getComponentProps?.() ?? {};
			return {
				id: config.id,
				title: config.title,
				content: () => {
					if (config.id !== activeTab) {
						return null;
					}
					return createTabComponent(config.id, {
						setting,
						...componentProps,
					});
				},
			};
		});

	}, [setting, activeTab, translate, tabHooks]);

	const { getTabActions, getTabHandlers, getTabState } = useKioskSettingDetailTabRegistry(tabHooks);

	return {
		tabs,
		getTabActions,
		getTabHandlers,
		getTabState,
	};
};

export const useKioskSettingDetailBreadcrumbs = ({ setting }: { setting?: KioskSetting }): PageContainerProps['breadcrumbs'] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskSettings.title'), href: '../kiosk-settings' },
		{ title: setting?.name || translate('nikki.vendingMachine.kioskSettings.detail.title'), href: '#' },
	], [setting?.name, translate]);
};

export const useKioskSettingDetailTabChange = (
	setActiveTab: React.Dispatch<React.SetStateAction<KioskSettingDetailTabId>>,
) =>
	useCallback((value: string) => {
		setActiveTab(value as KioskSettingDetailTabId);
	}, [setActiveTab]);
