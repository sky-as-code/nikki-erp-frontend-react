import { Stack } from '@mantine/core';
import React from 'react';

import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';

import { Slideshow } from '../../../slideshow/types';
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
			onChange={(v) => {
				if (v) {
					onThemeChange?.(v);
				}
				else {
					onThemeRemove?.();
				}
			}}
			isEditing={Boolean(onThemeChange)}
		/>
		<SlideshowSelect
			type='waiting'
			value={idlePlaylist}
			onChange={(v) => {
				if (v) {
					onIdlePlaylistChange?.(v);
				}
				else {
					onIdlePlaylistRemove();
				}
			}}
			isEditing={Boolean(onIdlePlaylistChange)}
		/>
		<SlideshowSelect
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
