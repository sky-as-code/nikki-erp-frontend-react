/* eslint-disable max-lines-per-function */
import { Badge, Box, Divider, Stack, Text } from '@mantine/core';
import { IconSettings2 } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { AssignedKioskList } from '@/components/AssignKiosks';
import { KioskSelectModal } from '@/components/AssignKiosks/KioskSelectModal';
import { GameSelect } from '@/components/GameSelect';
import { PreviewDrawer } from '@/components/PreviewDrawer';
import { MediaPlaylistSelect } from '@/components/MediaPlaylistSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { Game } from '@/features/games/types';
import { Kiosk } from '@/features/kiosks/types';
import { Slideshow } from '@/features/mediaPlaylist/types';
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
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: setting?.name,
				subtitle: setting?.code,
				avatar: <IconSettings2 size={20} />,
			}}
			onViewDetails={() => {
				if (setting?.id) {
					navigate(`../kiosk-settings/${setting.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!setting && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='md'>
				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.code')}</Text>
					<Text size='sm' fw={500}>{setting?.code}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.name')}</Text>
					<Text size='sm'>{setting?.name}</Text>
				</Box>

				{setting?.description && (
					<>
						<Divider />
						<Box>
							<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.description')}</Text>
							<Text size='sm'>{setting.description}</Text>
						</Box>
					</>
				)}

				{setting?.brand && (
					<>
						<Divider />
						<Box>
							<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.brand')}</Text>
							<Text size='sm'>{setting.brand}</Text>
						</Box>
					</>
				)}

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.status')}</Text>
					{setting?.status ? getStatusBadge(setting.status) : null}
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}</Text>
					<Text size='sm'>{setting?.createdAt ? new Date(setting.createdAt).toLocaleString() : '—'}</Text>
				</Box>

				{/* Kiosks Section */}
				<Divider />
				<Box>
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('nikki.vendingMachine.kioskSettings.fields.kiosks')}
					</Text>
					<AssignedKioskList
						kiosks={settingKiosks}
						onAddKiosks={() => setKioskSelectModalOpened(true)}
						onRemoveKiosk={handleRemoveKiosk}
					/>
				</Box>

				{/* Theme and Slideshow Configuration */}
				<Divider />
				<Box>
					<Stack gap='md'>
						<ThemeSelect
							value={settingTheme}
							onChange={(v) => {
								if (v) {
									handleThemeChange(v);
								}
							}}
							onRemove={handleThemeRemove}
							isEditing
						/>
						<MediaPlaylistSelect
							type='waiting'
							value={idlePlaylist}
							onRemove={handleIdlePlaylistRemove}
							onChange={(v) => {
								if (v) {
									handleIdlePlaylistChange(v);
								}
							}}
							isEditing
						/>
						<MediaPlaylistSelect
							type='shopping'
							value={shoppingPlaylist}
							onRemove={handleShoppingPlaylistRemove}
							onChange={(v) => {
								if (v) {
									handleShoppingPlaylistChange(v);
								}
							}}
							isEditing
						/>
					</Stack>
				</Box>

				{/* Game Configuration */}
				<Box>
					<GameSelect
						value={settingGame}
						onRemove={handleGameRemove}
						onChange={(v) => {
							if (v) {
								handleGameChange(v);
							}
						}}
						isEditing
					/>
				</Box>

				<Box h={50}></Box>
			</Stack>

			{/* Modals */}
			<KioskSelectModal
				opened={kioskSelectModalOpened}
				onClose={() => setKioskSelectModalOpened(false)}
				onSelectKiosks={handleAddKiosks}
				selectedKioskIds={settingKiosks.map((k) => k.id)}
			/>
		</PreviewDrawer>
	);
};
