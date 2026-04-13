import { Stack } from '@mantine/core';
import React from 'react';


import { GameSelect } from '@/components/GameSelect';
import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { UIModeSelect } from '@/components/UIModeSelect';
import { Kiosk } from '@/features/kiosks/types';

import { useKioskSettingTab } from './hooks';


interface KioskDetailSettingsProps {
	kiosk: Kiosk;
}

export const KioskDetailSettings: React.FC<KioskDetailSettingsProps> = ({ kiosk }) => {
	const {
		isEditing,
		isSubmitting,
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
				disabled={isSubmitting ?? false}
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
