import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { Game } from '@/features/games/types';
import { Slideshow } from '@/features/mediaPlaylist/types';
import { Theme } from '@/features/themes/types';

import { KioskSetting } from '../../../types';
import { useRegisterKioskSettingDetailTab } from '../kioskSettingDetailTabControl';
import { useKioskSettingDetailPersistence } from './useKioskSettingDetailPersistence';
import type { KioskSettingUpdatePayload } from './types';


type UseKioskSettingSettingsTabArgs = {
	setting: KioskSetting;
};

export function useKioskSettingSettingsTab({ setting }: UseKioskSettingSettingsTabArgs) {
	const { t: translate } = useTranslation();
	const { onSaveSettings } = useKioskSettingDetailPersistence(setting);

	const [isEditing, setIsEditing] = useState(false);
	const [draftTheme, setDraftTheme] = useState<Theme | undefined>(undefined);
	const [draftGame, setDraftGame] = useState<Game | undefined>(undefined);
	const [idlePlaylist, setIdlePlaylist] = useState<Slideshow | undefined>(undefined);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Slideshow | undefined>(undefined);

	const resetDraftFromSetting = useCallback(() => {
		setDraftTheme(setting.theme);
		setDraftGame(setting.game);
		setIdlePlaylist(setting.idlePlaylist);
		setShoppingPlaylist(setting.shoppingPlaylist);
	}, [setting]);

	useEffect(() => {
		resetDraftFromSetting();
	}, [setting.id, setting.etag, resetDraftFromSetting]);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(async () => {
		await onSaveSettings({
			themeId: draftTheme?.id,
			theme: draftTheme,
			gameId: draftGame?.id,
			game: draftGame,
			idlePlaylist,
			shoppingPlaylist,
		} as KioskSettingUpdatePayload);
		setIsEditing(false);
	}, [onSaveSettings, draftTheme, draftGame, idlePlaylist, shoppingPlaylist]);
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

	useRegisterKioskSettingDetailTab('settings', actions);

	return {
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
	};
}
