/* eslint-disable max-lines-per-function */
import { Box, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconPalette, IconPhoto, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideshowCard } from './SlideshowCard';
import { SlideshowSelectModal } from './SlideshowSelectModal';
import { ThemePreviewCard } from './ThemePreviewCard';
import { ThemeSelectModal } from './ThemeSelectModal';
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
}) => {
	const { t: translate } = useTranslation();
	const [themeSelectModalOpened, setThemeSelectModalOpened] = useState(false);
	const [slideshowSelectModalOpened, setSlideshowSelectModalOpened] = useState(false);
	const [playlistType, setPlaylistType] = useState<'idle' | 'shopping'>('idle');

	const handleOpenSlideshowSelect = (type: 'idle' | 'shopping') => {
		setPlaylistType(type);
		setSlideshowSelectModalOpened(true);
	};

	const handleSelectSlideshows = (slideshows: Slideshow[]) => {
		if (playlistType === 'idle' && onIdlePlaylistChange) {
			onIdlePlaylistChange(slideshows[0]);
		}
		else if (playlistType === 'shopping' && onShoppingPlaylistChange) {
			onShoppingPlaylistChange(slideshows[0]);
		}
	};

	const handleSelectTheme = (selectedTheme: Theme) => {
		if (onThemeChange) {
			onThemeChange(selectedTheme);
		}
	};

	return (
		<Stack gap='md'>
			{/* Theme Selection */}
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.theme')}
				</Text>
				{theme ? (
					<ThemePreviewCard
						theme={theme}
						onRemove={onThemeRemove}
					/>
				) : (
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' justify='space-between'>
							<Box>
								<Group gap='xs' mb='sm'>
									<IconPalette size={20} />
									<Text size='sm' fw={500}>
										{translate('nikki.vendingMachine.events.fields.theme')}
									</Text>
								</Group>

								<Text size='sm' c='dimmed'>
									{translate('nikki.vendingMachine.events.messages.no_theme')}
								</Text>
							</Box>
							{onThemeChange && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => setThemeSelectModalOpened(true)}
								>
									{translate('nikki.vendingMachine.events.selectTheme.selectTheme')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.idlePlaylist')}
				</Text>
				{idlePlaylist ? (
					<SlideshowCard slideshow={idlePlaylist} onRemove={onIdlePlaylistRemove} />
				) : (
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' justify='space-between'>
							<Box>
								<Group gap='xs' mb='sm'>
									<IconPhoto size={20} />
									<Text size='sm' fw={500}>
										{translate('nikki.vendingMachine.events.playlist.idleScreen')}
									</Text>
								</Group>

								<Text size='sm' c='dimmed'>
									{translate('nikki.vendingMachine.events.messages.no_idle_playlist')}
								</Text>
							</Box>
							{onIdlePlaylistChange && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => handleOpenSlideshowSelect('idle')}
								>
									{translate('nikki.vendingMachine.events.playlist.selectSlideshows')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.shoppingPlaylist')}
				</Text>
				{shoppingPlaylist ? (
					<SlideshowCard slideshow={shoppingPlaylist} onRemove={onShoppingPlaylistRemove} />
				) : (
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' justify='space-between'>
							<Box>
								<Group gap='xs' mb='sm'>
									<IconPhoto size={20} />
									<Text size='sm' fw={500}>
										{translate('nikki.vendingMachine.events.playlist.shoppingScreen')}
									</Text>
								</Group>

								<Text size='sm' c='dimmed'>
									{translate('nikki.vendingMachine.events.messages.no_shopping_playlist')}
								</Text>
							</Box>
							{onShoppingPlaylistChange && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => handleOpenSlideshowSelect('shopping')}
								>
									{translate('nikki.vendingMachine.events.playlist.selectSlideshows')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			{/* Theme Select Modal */}
			<ThemeSelectModal
				opened={themeSelectModalOpened}
				onClose={() => setThemeSelectModalOpened(false)}
				onSelectTheme={handleSelectTheme}
				selectedThemeId={themeId || theme?.id}
			/>

		{/* Slideshow Select Modal */}
		<SlideshowSelectModal
			opened={slideshowSelectModalOpened}
			onClose={() => setSlideshowSelectModalOpened(false)}
			onSelectSlideshows={handleSelectSlideshows}
		/>
		</Stack>
	);
};
