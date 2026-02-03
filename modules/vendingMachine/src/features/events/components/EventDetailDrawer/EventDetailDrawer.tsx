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
import { Event, EventProduct, SlideshowPlaylist } from '../../types';


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
	const [slideshowPlaylists, setSlideshowPlaylists] = useState<SlideshowPlaylist[]>(event?.slideshowPlaylists || []);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);
	const [productSelectModalOpened, setProductSelectModalOpened] = useState(false);

	// Update products, kiosks, theme, and playlists when event changes
	useEffect(() => {
		if (event) {
			setEventProducts(event.products || []);
			setEventKiosks(event.kiosks || []);
			setEventTheme(event.theme);
			setSlideshowPlaylists(event.slideshowPlaylists || []);
		}
	}, [event]);

	if (isLoading || !event) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='lg'
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

	const handleThemeChange = (theme: Theme) => {
		setEventTheme(theme);
	};

	const handleThemeRemove = () => {
		setEventTheme(undefined);
	};

	const handlePlaylistChange = (type: 'idle' | 'shopping', ads: Ad[]) => {
		// Convert ads to playlist media format
		let orderCounter = 1;
		const media = ads.flatMap((ad) =>
			ad.media.map((adMedia) => {
				const order = adMedia.order || orderCounter++;
				return {
					id: `${ad.id}-${adMedia.id}-${order}`,
					mediaId: adMedia.id,
					url: adMedia.url,
					thumbnailUrl: adMedia.thumbnailUrl,
					type: adMedia.type,
					duration: adMedia.duration,
					order,
				};
			}),
		);

		setSlideshowPlaylists((prev) => {
			const existing = prev.find((p) => p.type === type);
			if (existing) {
				// Update existing playlist
				return prev.map((p) =>
					p.type === type
						? { ...p, media }
						: p,
				);
			}
			// Create new playlist
			return [
				...prev,
				{
					id: `${type}-${Date.now()}`,
					type,
					media,
				},
			];
		});
	};

	const handlePlaylistMediaRemove = (type: 'idle' | 'shopping', mediaId: string) => {
		setSlideshowPlaylists((prev) =>
			prev.map((playlist) =>
				playlist.type === type
					? {
						...playlist,
						media: playlist.media.filter((m) => m.id !== mediaId),
					}
					: playlist,
			),
		);
	};

	const handlePlaylistRemove = (type: 'idle' | 'shopping') => {
		setSlideshowPlaylists((prev) => prev.filter((playlist) => playlist.type !== type));
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
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('nikki.vendingMachine.events.fields.themeAndSlideshow')}
					</Text>
					<EventThemeConfig
						theme={eventTheme}
						themeId={event.themeId}
						slideshowPlaylists={slideshowPlaylists}
						onThemeChange={handleThemeChange}
						onThemeRemove={handleThemeRemove}
						onPlaylistChange={handlePlaylistChange}
						onPlaylistMediaRemove={handlePlaylistMediaRemove}
						onPlaylistRemove={handlePlaylistRemove}
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

