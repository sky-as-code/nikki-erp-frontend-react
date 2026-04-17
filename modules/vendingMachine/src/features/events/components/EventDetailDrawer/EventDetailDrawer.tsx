import { Badge, Box, Divider, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PreviewDrawer } from '@/components/PreviewDrawer';

import { EventGameConfig } from './EventGameConfig';
import { EventKioskList } from './EventKioskList';
import { EventProductList } from './EventProductList';
import { EventThemeConfig } from './EventThemeConfig';
import { KioskSelectModal } from './KioskSelectModal';
import { ProductSelectModal } from './ProductSelectModal';
import { Game } from '../../../games/types';
import { Kiosk } from '../../../kiosks/types';
import { Slideshow } from '../../../mediaPlaylist/types';
import { Theme } from '../../../themes/types';
import { Event, EventProduct } from '../../types';


export interface EventDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	event: Event | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
	opened,
	onClose,
	event,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [eventProducts, setEventProducts] = useState<EventProduct[]>(event?.products || []);
	const [eventKiosks, setEventKiosks] = useState<Kiosk[]>(event?.kiosks || []);
	const [eventTheme, setEventTheme] = useState<Theme | undefined>(event?.theme);
	const [eventGame, setEventGame] = useState<Game | undefined>(event?.game);
	const [idlePlaylist, setIdlePlaylist] = useState<Slideshow | undefined>(event?.idlePlaylist);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Slideshow | undefined>(event?.shoppingPlaylist);
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
				title: event?.name,
				subtitle: event?.code,
				avatar: <IconCalendarEvent size={20} />,
			}}
			onViewDetails={() => {
				if (event?.id) {
					navigate(`../events/${event.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!event && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{event?.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.name')}
					</Text>
					<Text size='sm'>{event?.name}</Text>
				</div>

				{event?.description && (
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
					{event?.status ? getStatusBadge(event.status) : null}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.startDate')}
					</Text>
					<Text size='sm'>{event?.startDate ? new Date(event.startDate).toLocaleString() : '—'}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.endDate')}
					</Text>
					<Text size='sm'>{event?.endDate ? new Date(event.endDate).toLocaleString() : '—'}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.createdAt')}
					</Text>
					<Text size='sm'>{event?.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}</Text>
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
						themeId={event?.themeId}
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
						gameId={event?.gameId}
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
				selectedKioskIds={eventKiosks.map((k) => k.id)}
			/>

			<ProductSelectModal
				opened={productSelectModalOpened}
				onClose={() => setProductSelectModalOpened(false)}
				onSelectProducts={handleAddProducts}
				selectedProductIds={eventProducts.map((p) => p.id)}
			/>
		</PreviewDrawer>
	);
};

