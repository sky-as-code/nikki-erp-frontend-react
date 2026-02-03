/* eslint-disable max-lines-per-function */
import { ActionIcon, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconPalette, IconPhoto, IconPlus, IconShoppingCart, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdSelectModal } from './AdSelectModal';
import { PlaylistMediaList } from './PlaylistMediaList';
import { ThemePreviewCard } from './ThemePreviewCard';
import { ThemeSelectModal } from './ThemeSelectModal';
import { Ad } from '../../../ads/types';
import { Theme } from '../../../themes/types';
import { SlideshowPlaylist } from '../../types';


export interface EventThemeConfigProps {
	theme?: Theme;
	themeId?: string;
	slideshowPlaylists?: SlideshowPlaylist[];
	onThemeChange?: (theme: Theme) => void;
	onThemeRemove?: () => void;
	onPlaylistChange?: (type: 'idle' | 'shopping', ads: Ad[]) => void;
	onPlaylistMediaRemove?: (type: 'idle' | 'shopping', mediaId: string) => void;
	onPlaylistRemove?: (type: 'idle' | 'shopping') => void;
}

export const EventThemeConfig: React.FC<EventThemeConfigProps> = ({
	theme,
	themeId,
	slideshowPlaylists = [],
	onThemeChange,
	onThemeRemove,
	onPlaylistChange,
	onPlaylistMediaRemove,
	onPlaylistRemove,
}) => {
	const { t: translate } = useTranslation();
	const [themeSelectModalOpened, setThemeSelectModalOpened] = useState(false);
	const [adSelectModalOpened, setAdSelectModalOpened] = useState(false);
	const [playlistType, setPlaylistType] = useState<'idle' | 'shopping'>('idle');

	const idlePlaylist = slideshowPlaylists.find((p) => p.type === 'idle');
	const shoppingPlaylist = slideshowPlaylists.find((p) => p.type === 'shopping');

	const handleOpenAdSelect = (type: 'idle' | 'shopping') => {
		setPlaylistType(type);
		setAdSelectModalOpened(true);
	};

	const handleSelectAds = (ads: Ad[]) => {
		if (onPlaylistChange) {
			onPlaylistChange(playlistType, ads);
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
				<Card withBorder p='sm' radius='md'>
					<Group gap='xs' mb='sm' justify='space-between'>
						<Group gap='xs'>
							<IconPalette size={20} />
							<Text size='sm' fw={500}>
								{translate('nikki.vendingMachine.events.fields.theme')}
							</Text>
						</Group>
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
					{theme ? (
						<ThemePreviewCard
							theme={theme}
							onRemove={onThemeRemove}
						/>
					) : (
						<Text size='sm' c='dimmed'>
							{translate('nikki.vendingMachine.events.messages.no_theme')}
						</Text>
					)}
				</Card>
			</div>

			{/* Slideshow Playlists */}
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.slideshowPlaylists')}
				</Text>

				<Stack gap='md'>
					{/* Idle Screen Playlist */}
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' mb='sm' justify='space-between'>
							<Group gap='xs'>
								<IconPhoto size={20} />
								<Text size='sm' fw={500}>
									{translate('nikki.vendingMachine.events.playlist.idleScreen')}
								</Text>
							</Group>
							<Group gap='xs'>
								{idlePlaylist && onPlaylistRemove && (
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										onClick={() => onPlaylistRemove('idle')}
									>
										<IconTrash size={16} />
									</ActionIcon>
								)}
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => handleOpenAdSelect('idle')}
								>
									{translate('nikki.vendingMachine.events.playlist.selectAds')}
								</Button>
							</Group>
						</Group>
						{idlePlaylist ? (
							<PlaylistMediaList
								playlist={idlePlaylist}
								onRemoveMedia={onPlaylistMediaRemove ? (mediaId) => onPlaylistMediaRemove('idle', mediaId) : undefined}
							/>
						) : (
							<Text size='sm' c='dimmed'>
								{translate('nikki.vendingMachine.events.messages.no_idle_playlist')}
							</Text>
						)}
					</Card>

					{/* Shopping Screen Playlist */}
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' mb='sm' justify='space-between'>
							<Group gap='xs'>
								<IconShoppingCart size={20} />
								<Text size='sm' fw={500}>
									{translate('nikki.vendingMachine.events.playlist.shoppingScreen')}
								</Text>
							</Group>
							<Group gap='xs'>
								{shoppingPlaylist && onPlaylistRemove && (
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										onClick={() => onPlaylistRemove('shopping')}
									>
										<IconTrash size={16} />
									</ActionIcon>
								)}
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => handleOpenAdSelect('shopping')}
								>
									{translate('nikki.vendingMachine.events.playlist.selectAds')}
								</Button>
							</Group>
						</Group>
						{shoppingPlaylist ? (
							<PlaylistMediaList
								playlist={shoppingPlaylist}
								onRemoveMedia={onPlaylistMediaRemove ? (mediaId) => onPlaylistMediaRemove('shopping', mediaId) : undefined}
							/>
						) : (
							<Text size='sm' c='dimmed'>
								{translate('nikki.vendingMachine.events.messages.no_shopping_playlist')}
							</Text>
						)}
					</Card>
				</Stack>
			</div>

			{/* Theme Select Modal */}
			<ThemeSelectModal
				opened={themeSelectModalOpened}
				onClose={() => setThemeSelectModalOpened(false)}
				onSelectTheme={handleSelectTheme}
				selectedThemeId={themeId || theme?.id}
			/>

			{/* Ad Select Modal */}
			<AdSelectModal
				opened={adSelectModalOpened}
				onClose={() => setAdSelectModalOpened(false)}
				onSelectAds={handleSelectAds}
			/>
		</Stack>
	);
};
