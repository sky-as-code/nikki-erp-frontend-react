import { Badge, Box, Button, Divider, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconPresentation, IconExternalLink } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Slideshow, SlideshowMedia, GalleryMedia } from '../../types';
import { SlideshowPreviewHorizontal } from '../SlideshowPreviewHorizontal';
import { SlideshowPreviewVertical } from '../SlideshowPreviewVertical';
import { MediaGalleryModal } from '../MediaGalleryModal';
import { MediaList } from '../MediaList';


export interface SlideshowDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	slideshow: Slideshow | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const SlideshowDetailDrawer: React.FC<SlideshowDetailDrawerProps> = ({
	opened,
	onClose,
	slideshow,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [galleryModalOpened, setGalleryModalOpened] = useState(false);
	const [slideshowMedia, setSlideshowMedia] = useState<SlideshowMedia[]>(slideshow?.media || []);

	React.useEffect(() => {
		if (slideshow) {
			setSlideshowMedia(slideshow.media || []);
		}
	}, [slideshow]);

	if (isLoading || !slideshow) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='xl'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.slideshow.detail.title')}</Text>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			expired: { color: 'red', label: translate('nikki.vendingMachine.slideshow.status.expired') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const handleAddMedia = () => {
		setGalleryModalOpened(true);
	};

	const handleSelectMedia = (selectedMedia: GalleryMedia[]) => {
		const newMedia: SlideshowMedia[] = selectedMedia.map((item, index) => ({
			id: item.id,
			code: item.code,
			name: item.name,
			type: item.type,
			url: item.url,
			thumbnailUrl: item.thumbnailUrl,
			duration: item.duration,
			order: slideshowMedia.length + index + 1,
		}));
		setSlideshowMedia([...slideshowMedia, ...newMedia]);
	};

	const handleRemoveMedia = (mediaId: string) => {
		setSlideshowMedia(slideshowMedia.filter((m) => m.id !== mediaId).map((m, index) => ({ ...m, order: index + 1 })));
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
						<IconPresentation size={20} />
						<Text fw={600} size='lg'>{slideshow.name}</Text>
					</Group>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconExternalLink size={16} />}
						onClick={() => {
							navigate(`../slideshow/${slideshow.id}`);
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
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{slideshow.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.name')}
					</Text>
					<Text size='sm'>{slideshow.name}</Text>
				</div>

				{slideshow.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.slideshow.fields.description')}
							</Text>
							<Text size='sm'>{slideshow.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.status')}
					</Text>
					{getStatusBadge(slideshow.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.startDate')}
					</Text>
					<Text size='sm'>{new Date(slideshow.startDate).toLocaleString()}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.endDate')}
					</Text>
					<Text size='sm'>{new Date(slideshow.endDate).toLocaleString()}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(slideshow.createdAt).toLocaleString()}</Text>
				</div>

				<Divider />

				{/* Media List Section */}
				<div>
					<MediaList
						media={slideshowMedia}
						onAddMedia={handleAddMedia}
						onRemoveMedia={handleRemoveMedia}
					/>
				</div>

				<Divider />

				{/* Preview Section */}
				<div>
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('nikki.vendingMachine.slideshow.preview.title')}
					</Text>
					<Stack gap='lg'>
						{/* Vertical Preview (9:16) - Full screen slideshow for idle/waiting screen */}
						<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
							<Text size='xs' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.slideshow.preview.vertical')}
							</Text>
							<SlideshowPreviewVertical slideshow={slideshow} />
						</Stack>

						{/* Horizontal Preview - Slideshow in footer area */}

						<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.slideshow.preview.horizontal')}
							</Text>
							<SlideshowPreviewHorizontal slideshow={slideshow} />
						</Stack>

						<Divider />
						<Box h={100}></Box>
					</Stack>
				</div>
			</Stack>

			{/* Media Gallery Modal */}
			<MediaGalleryModal
				opened={galleryModalOpened}
				onClose={() => setGalleryModalOpened(false)}
				onSelectMedia={handleSelectMedia}
				selectedMediaIds={slideshowMedia.map((m) => m.id)}
			/>
		</Drawer>
	);
};
