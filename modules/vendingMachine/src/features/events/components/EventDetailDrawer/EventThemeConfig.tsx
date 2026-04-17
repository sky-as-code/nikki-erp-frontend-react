import { Stack } from '@mantine/core';
import React from 'react';

import { MediaPlaylistSelect } from '@/components/MediaPlaylistSelect';
import { ThemeSelect } from '@/components/ThemeSelect';

import { Slideshow } from '../../../mediaPlaylist/types';
import { Theme } from '../../../themes/types';


export interface EventThemeConfigProps {
	theme?: Theme;
	themeId?: string;
	idlePlaylist?: Slideshow;
	shoppingPlaylist?: Slideshow;
	onThemeChange?: (theme: Theme) => void;
	onThemeRemove?: () => void;
	onIdlePlaylistChange?: (slideshow: Slideshow) => void;
	onShoppingPlaylistChange?: (slideshow: Slideshow) => void;
	onIdlePlaylistRemove?: () => void;
	onShoppingPlaylistRemove?: () => void;
}

export const EventThemeConfig: React.FC<EventThemeConfigProps> = ({
	theme,
	idlePlaylist,
	shoppingPlaylist,
	onThemeChange,
	onThemeRemove,
	onIdlePlaylistChange,
	onShoppingPlaylistChange,
	onIdlePlaylistRemove = () => {},
	onShoppingPlaylistRemove = () => {},
}) => (
	<Stack gap='md'>
		<ThemeSelect
			value={theme}
			onRemove={onThemeRemove}
			onChange={(v) => {
				if (v) {
					onThemeChange?.(v);
				}
			}}
			isEditing={Boolean(onThemeChange)}
		/>
		<MediaPlaylistSelect
			type='waiting'
			value={idlePlaylist}
			onRemove={onIdlePlaylistRemove}
			onChange={(v) => {
				if (v) {
					onIdlePlaylistChange?.(v);
				}
			}}
			isEditing={Boolean(onIdlePlaylistChange)}
		/>
		<MediaPlaylistSelect
			type='shopping'
			value={shoppingPlaylist}
			onChange={(v) => {
				if (v) {
					onShoppingPlaylistChange?.(v);
				}
				else {
					onShoppingPlaylistRemove();
				}
			}}
			isEditing={Boolean(onShoppingPlaylistChange)}
		/>
	</Stack>
);
