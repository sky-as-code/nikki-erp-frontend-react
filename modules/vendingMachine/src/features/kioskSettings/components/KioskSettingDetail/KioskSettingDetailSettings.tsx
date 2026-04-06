import { Stack } from '@mantine/core';
import React from 'react';

import { GameSelect } from '@/components/GameSelect';
import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';

import { KioskSetting } from '../../types';
import { useKioskSettingSettingsTab } from './hooks/useKioskSettingSettingsTab';


export type KioskSettingDetailSettingsProps = {
	setting: KioskSetting;
};

export const KioskSettingDetailSettings: React.FC<KioskSettingDetailSettingsProps> = ({
	setting,
}) => {
	const {
		isEditing,
		settingTheme,
		settingGame,
		idlePlaylist,
		shoppingPlaylist,
		onThemeChange,
		onThemeRemove,
		onGameChange,
		onGameRemove,
		onIdlePlaylistChange,
		onShoppingPlaylistChange,
		onIdlePlaylistRemove,
		onShoppingPlaylistRemove,
	} = useKioskSettingSettingsTab({ setting });

	return (
		<Stack
			gap='lg'
			// style={isEditing ? undefined : { pointerEvents: 'none', opacity: 0.72 }}
		>
			<ThemeSelect
				value={settingTheme}
				onChange={onThemeChange}
				onRemove={onThemeRemove}
				isEditing={isEditing}
			/>
			<SlideshowSelect
				type='waiting'
				value={idlePlaylist}
				onChange={onIdlePlaylistChange}
				onRemove={onIdlePlaylistRemove}
				isEditing={isEditing}
			/>
			<SlideshowSelect
				type='shopping'
				value={shoppingPlaylist}
				onRemove={onShoppingPlaylistRemove}
				onChange={onShoppingPlaylistChange}
				isEditing={isEditing}
			/>
			<GameSelect
				value={settingGame}
				onChange={onGameChange}
				onRemove={onGameRemove}
				isEditing={isEditing}
			/>
		</Stack>
	);
};
