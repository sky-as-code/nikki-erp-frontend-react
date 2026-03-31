import { Stack } from '@mantine/core';
import React from 'react';

import { GameSelect } from '@/components/GameSelect';
import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { Game } from '@/features/games/types';
import { Slideshow } from '@/features/slideshow/types';
import { Theme } from '@/features/themes/types';

import { KioskSetting } from '../../types';


export type KioskSettingDetailSettingsProps = {
	/** Bản gốc từ server (themeId, gameId, …). Draft theme/game/slideshow do tab hook quản lý. */
	setting: KioskSetting;
	/** Khi tắt, cấu hình chỉ xem (không tương tác). */
	isEditing?: boolean;
	settingTheme: Theme | undefined;
	settingGame: Game | undefined;
	idlePlaylist: Slideshow | undefined;
	shoppingPlaylist: Slideshow | undefined;
	onThemeChange: (theme: Theme) => void;
	onThemeRemove: () => void;
	onGameChange: (game: Game) => void;
	onGameRemove: () => void;
	onIdlePlaylistChange: (slideshow: Slideshow) => void;
	onShoppingPlaylistChange: (slideshow: Slideshow) => void;
	onIdlePlaylistRemove: () => void;
	onShoppingPlaylistRemove: () => void;
};

export const KioskSettingDetailSettings: React.FC<KioskSettingDetailSettingsProps> = ({
	isEditing = true,
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
}) => (
	<Stack
		gap='lg'
		style={isEditing ? undefined : { pointerEvents: 'none', opacity: 0.72 }}
	>
		<ThemeSelect
			value={settingTheme}
			onChange={(v) => {
				if (v) {
					onThemeChange(v);
				}
				else {
					onThemeRemove();
				}
			}}
			isEditing={isEditing}
		/>
		<SlideshowSelect
			type='waiting'
			value={idlePlaylist}
			onChange={(v) => {
				if (v) {
					onIdlePlaylistChange(v);
				}
				else {
					onIdlePlaylistRemove();
				}
			}}
			isEditing={isEditing}
		/>
		<SlideshowSelect
			type='shopping'
			value={shoppingPlaylist}
			onChange={(v) => {
				if (v) {
					onShoppingPlaylistChange(v);
				}
				else {
					onShoppingPlaylistRemove();
				}
			}}
			isEditing={isEditing}
		/>
		<GameSelect
			value={settingGame}
			onChange={(v) => {
				if (v) {
					onGameChange(v);
				}
				else {
					onGameRemove();
				}
			}}
			isEditing={isEditing}
		/>
	</Stack>
);
