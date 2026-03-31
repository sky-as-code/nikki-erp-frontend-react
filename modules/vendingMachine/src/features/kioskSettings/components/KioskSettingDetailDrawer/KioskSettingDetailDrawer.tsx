/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Divider, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconExternalLink, IconSettings2 } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { AssignedKioskList } from '@/components/AssignKiosks';
import { KioskSelectModal } from '@/components/AssignKiosks/KioskSelectModal';
import { GameSelect } from '@/components/GameSelect';
import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { Game } from '@/features/games/types';
import { Kiosk } from '@/features/kiosks/types';
import { Slideshow } from '@/features/slideshow/types';
import { Theme } from '@/features/themes/types';

import { KioskSetting } from '../../types';


export interface KioskSettingDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	setting: KioskSetting | undefined;
	isLoading?: boolean;
}

export const KioskSettingDetailDrawer: React.FC<KioskSettingDetailDrawerProps> = ({
	opened,
	onClose,
	setting,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [settingKiosks, setSettingKiosks] = useState<Kiosk[]>(setting?.kiosks || []);
	const [settingTheme, setSettingTheme] = useState<Theme | undefined>(setting?.theme);
	const [settingGame, setSettingGame] = useState<Game | undefined>(setting?.game);
	const [idlePlaylist, setIdlePlaylist] = useState<Slideshow | undefined>(setting?.idlePlaylist);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Slideshow | undefined>(setting?.shoppingPlaylist);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);

	useEffect(() => {
		if (setting) {
			setSettingKiosks(setting.kiosks || []);
			setSettingTheme(setting.theme);
			setSettingGame(setting.game);
			setIdlePlaylist(setting.idlePlaylist);
			setShoppingPlaylist(setting.shoppingPlaylist);
		}
	}, [setting]);

	if (isLoading || !setting) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='xl'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.kioskSettings.detail.title')}</Text>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const info = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={info.color}>{info.label}</Badge>;
	};

	const handleAddKiosks = (kiosks: Kiosk[]) => {
		setSettingKiosks([...settingKiosks, ...kiosks]);
	};

	const handleRemoveKiosk = (kioskId: string) => {
		setSettingKiosks(settingKiosks.filter((k) => k.id !== kioskId));
	};

	const handleThemeChange = (theme: Theme) => {
		setSettingTheme(theme);
	};

	const handleThemeRemove = () => {
		setSettingTheme(undefined);
	};

	const handleGameChange = (game: Game) => {
		setSettingGame(game);
	};

	const handleGameRemove = () => {
		setSettingGame(undefined);
	};

	const handleIdlePlaylistChange = (slideshow: Slideshow) => {
		setIdlePlaylist(slideshow);
	};

	const handleShoppingPlaylistChange = (slideshow: Slideshow) => {
		setShoppingPlaylist(slideshow);
	};

	const handleIdlePlaylistRemove = () => {
		setIdlePlaylist(undefined);
	};

	const handleShoppingPlaylistRemove = () => {
		setShoppingPlaylist(undefined);
	};

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='xl'
			title={
				<Group gap='lg' justify='space-between' style={{ flex: 1 }} wrap='wrap'>
					<Group gap='xs'>
						<IconSettings2 size={20} />
						<Text fw={600} size='lg'>{setting.name}</Text>
					</Group>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconExternalLink size={16} />}
						onClick={() => {
							navigate(`../kiosk-settings/${setting.id}`);
							onClose();
						}}
					>
						{translate('nikki.general.actions.viewDetails')}
					</Button>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.code')}</Text>
					<Text size='sm' fw={500}>{setting.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.name')}</Text>
					<Text size='sm'>{setting.name}</Text>
				</div>

				{setting.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.description')}</Text>
							<Text size='sm'>{setting.description}</Text>
						</div>
					</>
				)}

				{setting.brand && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.brand')}</Text>
							<Text size='sm'>{setting.brand}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.status')}</Text>
					{getStatusBadge(setting.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}</Text>
					<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
				</div>

				{/* Kiosks Section */}
				<Divider />
				<div>
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('nikki.vendingMachine.kioskSettings.fields.kiosks')}
					</Text>
					<AssignedKioskList
						kiosks={settingKiosks}
						onAddKiosks={() => setKioskSelectModalOpened(true)}
						onRemoveKiosk={handleRemoveKiosk}
					/>
				</div>

				{/* Theme and Slideshow Configuration */}
				<Divider />
				<div>
					<Stack gap='md'>
						<ThemeSelect
							value={settingTheme}
							onChange={(v) => {
								if (v) {
									handleThemeChange(v);
								}
								else {
									handleThemeRemove();
								}
							}}
							isEditing
						/>
						<SlideshowSelect
							type='waiting'
							value={idlePlaylist}
							onChange={(v) => {
								if (v) {
									handleIdlePlaylistChange(v);
								}
								else {
									handleIdlePlaylistRemove();
								}
							}}
							isEditing
						/>
						<SlideshowSelect
							type='shopping'
							value={shoppingPlaylist}
							onChange={(v) => {
								if (v) {
									handleShoppingPlaylistChange(v);
								}
								else {
									handleShoppingPlaylistRemove();
								}
							}}
							isEditing
						/>
					</Stack>
				</div>

				{/* Game Configuration */}
				<div>
					<GameSelect
						value={settingGame}
						onChange={(v) => {
							if (v) {
								handleGameChange(v);
							}
							else {
								handleGameRemove();
							}
						}}
						isEditing
					/>
				</div>

				<Box h={50}></Box>
			</Stack>

			{/* Modals */}
			<KioskSelectModal
				opened={kioskSelectModalOpened}
				onClose={() => setKioskSelectModalOpened(false)}
				onSelectKiosks={handleAddKiosks}
				selectedKioskIds={settingKiosks.map((k) => k.id)}
			/>
		</Drawer>
	);
};
