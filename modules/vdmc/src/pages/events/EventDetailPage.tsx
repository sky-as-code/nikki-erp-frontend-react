import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { DetailControlPanel } from '@/components/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { Ad } from '@/features/ads/types';
import { useEventDetail } from '@/features/events';
import { EventGameConfig } from '@/features/events/components/EventDetailDrawer/EventGameConfig';
import { EventKioskList } from '@/features/events/components/EventDetailDrawer/EventKioskList';
import { EventProductList } from '@/features/events/components/EventDetailDrawer/EventProductList';
import { EventThemeConfig } from '@/features/events/components/EventDetailDrawer/EventThemeConfig';
import { KioskSelectModal } from '@/features/events/components/EventDetailDrawer/KioskSelectModal';
import { ProductSelectModal } from '@/features/events/components/EventDetailDrawer/ProductSelectModal';
import { Event, EventProduct } from '@/features/events/types';
import { Game } from '@/features/games/types';
import { Kiosk } from '@/features/kiosks/types';
import { Theme } from '@/features/themes/types';


export const EventDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { event, isLoading } = useEventDetail(id);

	const [eventProducts, setEventProducts] = useState<EventProduct[]>(event?.products || []);
	const [eventKiosks, setEventKiosks] = useState<Kiosk[]>(event?.kiosks || []);
	const [eventTheme, setEventTheme] = useState<Theme | undefined>(event?.theme);
	const [eventGame, setEventGame] = useState<Game | undefined>(event?.game);
	const [idlePlaylist, setIdlePlaylist] = useState<Ad | undefined>(event?.idlePlaylist);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Ad | undefined>(event?.shoppingPlaylist);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);
	const [productSelectModalOpened, setProductSelectModalOpened] = useState(false);

	// Update products, kiosks, theme, game, and playlists when event changes
	useEffect(() => {
		if (event) {
			setEventProducts(event.products || []);
			setEventKiosks(event.kiosks || []);
			setEventTheme(event.theme);
			setEventGame(event.game);
			setIdlePlaylist(event.idlePlaylist);
			setShoppingPlaylist(event.shoppingPlaylist);
		}
	}, [event]);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			completed: { color: 'blue', label: translate('nikki.vendingMachine.events.status.completed') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const handleAddKiosks = (kiosks: Kiosk[]) => {
		setEventKiosks([...eventKiosks, ...kiosks]);
	};

	const handleAddProducts = (products: EventProduct[]) => {
		setEventProducts([...eventProducts, ...products]);
	};

	const handleRemoveProduct = (productId: string) => {
		setEventProducts(eventProducts.filter((p) => p.id !== productId));
	};

	const handleRemoveKiosk = (kioskId: string) => {
		setEventKiosks(eventKiosks.filter((k) => k.id !== kioskId));
	};

	const handleThemeChange = (theme: Theme) => {
		setEventTheme(theme);
	};

	const handleThemeRemove = () => {
		setEventTheme(undefined);
	};

	const handleGameChange = (game: Game) => {
		setEventGame(game);
	};

	const handleGameRemove = () => {
		setEventGame(undefined);
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
		{ title: translate('nikki.vendingMachine.menu.events'), href: '../events' },
		{ title: event?.name || translate('nikki.vendingMachine.events.detail.title'), href: '#' },
	];

	if (isLoading || !event) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<DetailControlPanel
					onSave={() => {}}
					onGoBack={() => {}}
					onDelete={() => {}}
				/>}
			>
				<Stack gap='md'>
					<Group gap='xs' mb='md'>
						<IconCalendarEvent size={20} />
						<Text fw={600} size='lg'>{event.name}</Text>
					</Group>

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.events.fields.code')}
						</Text>
						<Text size='sm' fw={500}>{event.code}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.events.fields.name')}
						</Text>
						<Text size='sm'>{event.name}</Text>
					</div>

					{event.description && (
						<>
							<Divider />
							<div>
								<Text size='sm' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.events.fields.description')}
								</Text>
								<Text size='sm'>{event.description}</Text>
							</div>
						</>
					)}

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.events.fields.status')}
						</Text>
						{getStatusBadge(event.status)}
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.events.fields.startDate')}
						</Text>
						<Text size='sm'>{new Date(event.startDate).toLocaleString()}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.events.fields.endDate')}
						</Text>
						<Text size='sm'>{new Date(event.endDate).toLocaleString()}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.events.fields.createdAt')}
						</Text>
						<Text size='sm'>{new Date(event.createdAt).toLocaleString()}</Text>
					</div>

					{/* Kiosks Section */}
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb='md' fw={500}>
							{translate('nikki.vendingMachine.events.fields.kiosks')}
						</Text>
						<EventKioskList
							kiosks={eventKiosks}
							onAddKiosks={() => setKioskSelectModalOpened(true)}
							onRemoveKiosk={handleRemoveKiosk}
						/>
					</div>

					{/* Products Section */}
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb='md' fw={500}>
							{translate('nikki.vendingMachine.events.fields.products')}
						</Text>
						<EventProductList
							products={eventProducts}
							onAddProducts={() => setProductSelectModalOpened(true)}
							onRemoveProduct={handleRemoveProduct}
						/>
					</div>

					{/* Theme and Slideshow Configuration */}
					<Divider />
					<div>
						<EventThemeConfig
							theme={eventTheme}
							themeId={event.themeId}
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
							game={eventGame}
							gameId={event.gameId}
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
				selectedKioskIds={eventKiosks.map((k) => k.id)}
			/>

			<ProductSelectModal
				opened={productSelectModalOpened}
				onClose={() => setProductSelectModalOpened(false)}
				onSelectProducts={handleAddProducts}
				selectedProductIds={eventProducts.map((p) => p.id)}
			/>
		</>
	);
};
