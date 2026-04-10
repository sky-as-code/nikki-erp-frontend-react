import { Badge, Box, Divider, Stack, Text } from '@mantine/core';
import { IconPresentation } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PreviewDrawer } from '@/components/PreviewDrawer';

import { Slideshow, SlideshowMedia, GalleryMedia } from '../../types';
import { MediaGalleryModal } from '../MediaGalleryModal';
import { MediaList } from '../MediaList';
import { SlideshowPreviewHorizontal } from '../SlideshowPreviewHorizontal';
import { SlideshowPreviewVertical } from '../SlideshowPreviewVertical';


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
		setSlideshowMedia(slideshowMedia.filter(
			(m) => m.id !== mediaId,
		).map((m, index) => ({
			...m,
			order: index + 1,
		})));
	};

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: slideshow?.name,
				subtitle: slideshow?.code,
				avatar: <IconPresentation size={20} />,
			}}
			onViewDetails={() => {
				if (slideshow?.id) {
					navigate(`../slideshow/${slideshow.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!slideshow && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{slideshow?.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.name')}
					</Text>
					<Text size='sm'>{slideshow?.name}</Text>
				</div>

				{slideshow?.description && (
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
					{slideshow?.status ? getStatusBadge(slideshow.status) : null}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.startDate')}
					</Text>
					<Text size='sm'>{slideshow?.startDate ? new Date(slideshow.startDate).toLocaleString() : '—'}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.endDate')}
					</Text>
					<Text size='sm'>{slideshow?.endDate ? new Date(slideshow.endDate).toLocaleString() : '—'}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.slideshow.fields.createdAt')}
					</Text>
					<Text size='sm'>{slideshow?.createdAt ? new Date(slideshow.createdAt).toLocaleString() : '—'}</Text>
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
							{slideshow ? <SlideshowPreviewVertical slideshow={slideshow} /> : null}
						</Stack>

						{/* Horizontal Preview - Slideshow in footer area */}

						<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.slideshow.preview.horizontal')}
							</Text>
							{slideshow ? <SlideshowPreviewHorizontal slideshow={slideshow} /> : null}
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
		</PreviewDrawer>
	);
};
