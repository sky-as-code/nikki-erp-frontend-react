/* eslint-disable max-lines-per-function */
import { Box, Button, Card, Group, Select, Stack, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconPalette, IconPhoto, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Ad } from '@/features/ads/types';
import { AdCard } from '@/features/events/components/EventDetailDrawer/AdCard';
import { AdSelectModal } from '@/features/events/components/EventDetailDrawer/AdSelectModal';
import { GamePreviewCard } from '@/features/events/components/EventDetailDrawer/GamePreviewCard';
import { GameSelectModal } from '@/features/events/components/EventDetailDrawer/GameSelectModal';
import { ThemePreviewCard } from '@/features/events/components/EventDetailDrawer/ThemePreviewCard';
import { ThemeSelectModal } from '@/features/events/components/EventDetailDrawer/ThemeSelectModal';
import { Game } from '@/features/games/types';
import { InterfaceMode } from '@/features/kioskModels/types';
import { Kiosk } from '@/features/kiosks/types';
import { Theme } from '@/features/themes/types';


interface KioskSettingProps {
	kiosk: Kiosk;
	isEditing: boolean;
}

export const KioskSetting: React.FC<KioskSettingProps> = ({ kiosk: _kiosk, isEditing }) => {
	const { t: translate } = useTranslation();
	const [selectedInterfaceMode, setSelectedInterfaceMode] = useState<InterfaceMode | undefined>(undefined);
	const [idlePlaylist, setIdlePlaylist] = useState<Ad | undefined>(undefined);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Ad | undefined>(undefined);
	const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>(undefined);
	const [selectedGame, setSelectedGame] = useState<Game | undefined>(undefined);

	const [adSelectModalOpened, setAdSelectModalOpened] = useState(false);
	const [playlistType, setPlaylistType] = useState<'idle' | 'shopping'>('idle');
	const [themeSelectModalOpened, setThemeSelectModalOpened] = useState(false);
	const [gameSelectModalOpened, setGameSelectModalOpened] = useState(false);


	const handleOpenAdSelect = (type: 'idle' | 'shopping') => {
		setPlaylistType(type);
		setAdSelectModalOpened(true);
	};

	const handleSelectAds = (ads: Ad[]) => {
		if (ads.length > 0) {
			if (playlistType === 'idle') {
				setIdlePlaylist(ads[0]);
			}
			else {
				setShoppingPlaylist(ads[0]);
			}
		}
		setAdSelectModalOpened(false);
	};

	const handleSelectTheme = (theme: Theme) => {
		setSelectedTheme(theme);
		setThemeSelectModalOpened(false);
	};

	const handleSelectGame = (game: Game) => {
		setSelectedGame(game);
		setGameSelectModalOpened(false);
	};

	const handleRemoveIdlePlaylist = () => {
		setIdlePlaylist(undefined);
	};

	const handleRemoveShoppingPlaylist = () => {
		setShoppingPlaylist(undefined);
	};

	const handleRemoveTheme = () => {
		setSelectedTheme(undefined);
	};

	const handleRemoveGame = () => {
		setSelectedGame(undefined);
	};

	const getInterfaceModeLabel = (mode: InterfaceMode | undefined) => {
		if (!mode) return '-';
		const modeMap = {
			normal: translate('nikki.vendingMachine.kioskModels.interfaceMode.normal'),
			focus: translate('nikki.vendingMachine.kioskModels.interfaceMode.focus'),
		};
		return modeMap[mode] || mode;
	};

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.interfaceMode')}
				</Text>
				{isEditing ? (
					<Select
						value={selectedInterfaceMode || null}
						onChange={(value) => setSelectedInterfaceMode(value as InterfaceMode | undefined)}
						placeholder={translate('nikki.vendingMachine.kioskModels.fields.interfaceMode')}
						data={[
							{ value: 'normal', label: translate('nikki.vendingMachine.kioskModels.interfaceMode.normal') },
							{ value: 'focus', label: translate('nikki.vendingMachine.kioskModels.interfaceMode.focus') },
						]}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getInterfaceModeLabel(selectedInterfaceMode)}</Text>
					</Box>
				)}
			</div>

			{/* Idle Playlist (Màn hình chờ) */}
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.idlePlaylist')}
				</Text>
				{idlePlaylist ? (
					<AdCard ad={idlePlaylist} onRemove={isEditing ? handleRemoveIdlePlaylist : undefined} />
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
							{isEditing && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => handleOpenAdSelect('idle')}
								>
									{translate('nikki.vendingMachine.events.playlist.selectAds')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			{/* Shopping Playlist (Màn hình mua hàng) */}
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.shoppingPlaylist')}
				</Text>
				{shoppingPlaylist ? (
					<AdCard ad={shoppingPlaylist} onRemove={isEditing ? handleRemoveShoppingPlaylist : undefined} />
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
							{isEditing && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => handleOpenAdSelect('shopping')}
								>
									{translate('nikki.vendingMachine.events.playlist.selectAds')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.theme')}
				</Text>
				{selectedTheme ? (
					<ThemePreviewCard theme={selectedTheme} onRemove={isEditing ? handleRemoveTheme : undefined} />
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
							{isEditing && (
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
					{translate('nikki.vendingMachine.events.fields.game')}
				</Text>
				{selectedGame ? (
					<GamePreviewCard game={selectedGame} onRemove={isEditing ? handleRemoveGame : undefined} />
				) : (
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' justify='space-between'>
							<Box>
								<Group gap='xs' mb='sm'>
									<IconDeviceGamepad2 size={20} />
									<Text size='sm' fw={500}>
										{translate('nikki.vendingMachine.events.fields.game')}
									</Text>
								</Group>
								<Text size='sm' c='dimmed'>
									{translate('nikki.vendingMachine.events.messages.no_game')}
								</Text>
							</Box>
							{isEditing && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => setGameSelectModalOpened(true)}
								>
									{translate('nikki.vendingMachine.events.selectGame.selectGame')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			{/* Modals */}
			<AdSelectModal
				opened={adSelectModalOpened}
				onClose={() => setAdSelectModalOpened(false)}
				onSelectAds={handleSelectAds}
			/>

			<ThemeSelectModal
				opened={themeSelectModalOpened}
				onClose={() => setThemeSelectModalOpened(false)}
				onSelectTheme={handleSelectTheme}
			/>

			<GameSelectModal
				opened={gameSelectModalOpened}
				onClose={() => setGameSelectModalOpened(false)}
				onSelectGame={handleSelectGame}
			/>
		</Stack>
	);
};
