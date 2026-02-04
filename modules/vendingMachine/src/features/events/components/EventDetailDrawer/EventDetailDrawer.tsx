import { Badge, Divider, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EventKioskList } from './EventKioskList';
import { EventProductList } from './EventProductList';
import { EventThemeConfig } from './EventThemeConfig';
import { KioskSelectModal } from './KioskSelectModal';
import { ProductSelectModal } from './ProductSelectModal';
import { Ad } from '../../../ads/types';
import { Kiosk } from '../../../kiosks/types';
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
	const [eventProducts, setEventProducts] = useState<EventProduct[]>(event?.products || []);
	const [eventKiosks, setEventKiosks] = useState<Kiosk[]>(event?.kiosks || []);
	const [eventTheme, setEventTheme] = useState<Theme | undefined>(event?.theme);
	const [idlePlaylist, setIdlePlaylist] = useState<Ad | undefined>(event?.idlePlaylist);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Ad | undefined>(event?.shoppingPlaylist);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);
	const [productSelectModalOpened, setProductSelectModalOpened] = useState(false);

	// Update products, kiosks, theme, and playlists when event changes
	useEffect(() => {
		if (event) {
			setEventProducts(event.products || []);
			setEventKiosks(event.kiosks || []);
			setEventTheme(event.theme);
			setIdlePlaylist(event.idlePlaylist);
			setShoppingPlaylist(event.shoppingPlaylist);
		}
	}, [event]);

	if (isLoading || !event) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='xl'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.events.detail.title')}</Text>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

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

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='xl'
			title={
				<Group gap='xs'>
					<IconCalendarEvent size={20} />
					<Text fw={600} size='lg'>{event.name}</Text>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
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
		</Drawer>
	);
};

