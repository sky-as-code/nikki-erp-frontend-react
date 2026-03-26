import { Stack } from '@mantine/core';
import React from 'react';

import { SlideShowConfig } from '@/components/SlideShowConfig';
import { ThemeConfig } from '@/components/ThemeConfig';

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
	themeId,
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
		<ThemeConfig
			theme={theme}
			themeId={themeId}
			onChange={onThemeChange}
			onRemove={onThemeRemove}
		/>
		<SlideShowConfig
			variant='idle'
			slideshow={idlePlaylist}
			onChange={onIdlePlaylistChange}
			onRemove={onIdlePlaylistRemove}
		/>
		<SlideShowConfig
			variant='shopping'
			slideshow={shoppingPlaylist}
			onChange={onShoppingPlaylistChange}
			onRemove={onShoppingPlaylistRemove}
		/>
	</Stack>
);
