import { Badge, Box, Button, Divider, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconExternalLink, IconSettings2 } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { EventGameConfig } from '@/features/events/components/EventDetailDrawer/EventGameConfig';
import { EventKioskList } from '@/features/events/components/EventDetailDrawer/EventKioskList';
import { EventProductList } from '@/features/events/components/EventDetailDrawer/EventProductList';
import { EventThemeConfig } from '@/features/events/components/EventDetailDrawer/EventThemeConfig';
import { KioskSelectModal } from '@/features/events/components/EventDetailDrawer/KioskSelectModal';
import { ProductSelectModal } from '@/features/events/components/EventDetailDrawer/ProductSelectModal';
import { Slideshow } from '@/features/slideshow/types';
import { EventProduct } from '@/features/events/types';
import { Game } from '@/features/games/types';
import { Kiosk } from '@/features/kiosks/types';
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
	const [settingProducts, setSettingProducts] = useState<EventProduct[]>(setting?.products || []);
	const [settingTheme, setSettingTheme] = useState<Theme | undefined>(setting?.theme);
	const [settingGame, setSettingGame] = useState<Game | undefined>(setting?.game);
	const [idlePlaylist, setIdlePlaylist] = useState<Slideshow | undefined>(setting?.idlePlaylist);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Slideshow | undefined>(setting?.shoppingPlaylist);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);
	const [productSelectModalOpened, setProductSelectModalOpened] = useState(false);

	useEffect(() => {
		if (setting) {
			setSettingKiosks(setting.kiosks || []);
			setSettingProducts(setting.products || []);
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

	const handleAddProducts = (products: EventProduct[]) => {
		setSettingProducts([...settingProducts, ...products]);
	};

	const handleRemoveProduct = (productId: string) => {
		setSettingProducts(settingProducts.filter((p) => p.id !== productId));
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
					<EventKioskList
						kiosks={settingKiosks}
						onAddKiosks={() => setKioskSelectModalOpened(true)}
						onRemoveKiosk={handleRemoveKiosk}
					/>
				</div>

				{/* Products Section */}
				<Divider />
				<div>
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('nikki.vendingMachine.kioskSettings.fields.products')}
					</Text>
					<EventProductList
						products={settingProducts}
						onAddProducts={() => setProductSelectModalOpened(true)}
						onRemoveProduct={handleRemoveProduct}
					/>
				</div>

				{/* Theme and Slideshow Configuration */}
				<Divider />
				<div>
					<EventThemeConfig
						theme={settingTheme}
						themeId={setting.themeId}
						idlePlaylist={idlePlaylist}
						shoppingPlaylist={shoppingPlaylist}
						onIdlePlaylistChange={handleIdlePlaylistChange}
						onShoppingPlaylistChange={handleShoppingPlaylistChange}
						onIdlePlaylistRemove={handleIdlePlaylistRemove}
						onShoppingPlaylistRemove={handleShoppingPlaylistRemove}
						onThemeChange={handleThemeChange}
						onThemeRemove={handleThemeRemove}
					/>
				</div>

				{/* Game Configuration */}
				<div>
					<EventGameConfig
						game={settingGame}
						gameId={setting.gameId}
						onGameChange={handleGameChange}
						onGameRemove={handleGameRemove}
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

			<ProductSelectModal
				opened={productSelectModalOpened}
				onClose={() => setProductSelectModalOpened(false)}
				onSelectProducts={handleAddProducts}
				selectedProductIds={settingProducts.map((p) => p.id)}
			/>
		</Drawer>
	);
};
