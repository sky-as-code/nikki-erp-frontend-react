import { Stack } from '@mantine/core';
import React from 'react';

import { useKioskSettingTab } from './hooks';

import { GameSelect } from '@/components/GameSelect';
import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { UIModeSelect } from '@/components/UIModeSelect';
import { Kiosk } from '@/features/kiosks/types';


interface KioskDetailSettingsProps {
	kiosk: Kiosk;
}

export const KioskDetailSettings: React.FC<KioskDetailSettingsProps> = ({ kiosk }) => {
	const {
		isEditing,
		waitingScreenPlaylist,
		shoppingScreenPlaylist,
		theme,
		game,
		handleWaitingChange,
		handleShoppingChange,
		handleThemeChange,
		handleGameChange,
		handleUIModeChange,
		uiMode,
	} = useKioskSettingTab(kiosk);

	return (
		<Stack gap='md'>
			<UIModeSelect
				value={uiMode}
				onChange={handleUIModeChange}
				isEditing={isEditing}
			/>

			<SlideshowSelect
				type='waiting'
				value={waitingScreenPlaylist}
				onChange={handleWaitingChange}
				onRemove={() => handleWaitingChange(undefined)}
				isEditing={isEditing}
			/>

			<SlideshowSelect
				type='shopping'
				value={shoppingScreenPlaylist}
				onChange={handleShoppingChange}
				onRemove={() => handleShoppingChange(undefined)}
				isEditing={isEditing}
			/>

			<ThemeSelect
				value={theme}
				onChange={handleThemeChange}
				onRemove={() => handleThemeChange(undefined)}
				isEditing={isEditing}
			/>

			<GameSelect
				value={game}
				onChange={handleGameChange}
				onRemove={() => handleGameChange(undefined)}
				isEditing={isEditing}
			/>
		</Stack>
	);
};
