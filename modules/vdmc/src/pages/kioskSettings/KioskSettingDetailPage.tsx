import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconSettings2 } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { Ad } from '@/features/ads/types';
import { EventGameConfig } from '@/features/events/components/EventDetailDrawer/EventGameConfig';
import { EventKioskList } from '@/features/events/components/EventDetailDrawer/EventKioskList';
import { EventProductList } from '@/features/events/components/EventDetailDrawer/EventProductList';
import { EventThemeConfig } from '@/features/events/components/EventDetailDrawer/EventThemeConfig';
import { KioskSelectModal } from '@/features/events/components/EventDetailDrawer/KioskSelectModal';
import { ProductSelectModal } from '@/features/events/components/EventDetailDrawer/ProductSelectModal';
import { EventProduct } from '@/features/events/types';
import { Game } from '@/features/games/types';
import { Kiosk } from '@/features/kiosks/types';
import { useKioskSettingDetail } from '@/features/kioskSettings';
import { Theme } from '@/features/themes/types';


export const KioskSettingDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { setting, isLoading } = useKioskSettingDetail(id);

	const [settingKiosks, setSettingKiosks] = useState<Kiosk[]>(setting?.kiosks || []);
	const [settingProducts, setSettingProducts] = useState<EventProduct[]>(setting?.products || []);
	const [settingTheme, setSettingTheme] = useState<Theme | undefined>(setting?.theme);
	const [settingGame, setSettingGame] = useState<Game | undefined>(setting?.game);
	const [idlePlaylist, setIdlePlaylist] = useState<Ad | undefined>(setting?.idlePlaylist);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Ad | undefined>(setting?.shoppingPlaylist);
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

	const handleIdlePlaylistChange = (ad: Ad) => {
		setIdlePlaylist(ad);
	};

	const handleShoppingPlaylistChange = (ad: Ad) => {
		setShoppingPlaylist(ad);
	};

	const handleIdlePlaylistRemove = () => {
		setIdlePlaylist(undefined);
	};

	const handleShoppingPlaylistRemove = () => {
		setShoppingPlaylist(undefined);
	};

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskSettings.title'), href: '../kiosk-settings' },
		{ title: setting?.name || translate('nikki.vendingMachine.kioskSettings.detail.title'), href: '#' },
	];

	if (isLoading || !setting) {
		return (
			<PageContainer breadcrumbs={breadcrumbs} actionBar={<div />}>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<DetailActionBar onSave={() => {}} onGoBack={() => {}} onDelete={() => {}} />}
			>
				<Stack gap='md'>
					<Group gap='xs' mb='md'>
						<IconSettings2 size={20} />
						<Text fw={600} size='lg'>{setting.name}</Text>
					</Group>

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskSettings.fields.code')}
						</Text>
						<Text size='sm' fw={500}>{setting.code}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskSettings.fields.name')}
						</Text>
						<Text size='sm'>{setting.name}</Text>
					</div>

					{setting.description && (
						<>
							<Divider />
							<div>
								<Text size='sm' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.kioskSettings.fields.description')}
								</Text>
								<Text size='sm'>{setting.description}</Text>
							</div>
						</>
					)}

					{setting.brand && (
						<>
							<Divider />
							<div>
								<Text size='sm' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.kioskSettings.fields.brand')}
								</Text>
								<Text size='sm'>{setting.brand}</Text>
							</div>
						</>
					)}

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskSettings.fields.status')}
						</Text>
						{getStatusBadge(setting.status)}
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}
						</Text>
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
			</PageContainer>

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
		</>
	);
};
