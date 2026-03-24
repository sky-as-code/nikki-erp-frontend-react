/* eslint-disable max-lines-per-function */
import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconPresentation } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { DetailControlPanel } from '@/components/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { useSlideshowDetail } from '@/features/slideshow';
import { SlideshowPreviewHorizontal } from '@/features/slideshow/components/SlideshowPreviewHorizontal';
import { SlideshowPreviewVertical } from '@/features/slideshow/components/SlideshowPreviewVertical';
import { MediaGalleryModal } from '@/features/slideshow/components/MediaGalleryModal';
import { MediaList } from '@/features/slideshow/components/MediaList';
import { SlideshowMedia, GalleryMedia } from '@/features/slideshow/types';


export const SlideshowDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { slideshow, isLoading } = useSlideshowDetail(id);
	const [galleryModalOpened, setGalleryModalOpened] = useState(false);
	const [slideshowMedia, setSlideshowMedia] = useState<SlideshowMedia[]>(slideshow?.media || []);
	const navigate = useNavigate();

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
		setSlideshowMedia(slideshowMedia.filter((m) => m.id !== mediaId).map((m, index) => ({ ...m, order: index + 1 })));
	};

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.slideshow.title'), href: '../slideshow' },
		{ title: slideshow?.name || translate('nikki.vendingMachine.slideshow.detail.title'), href: '#' },
	];

	if (isLoading || !slideshow) {
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
					onGoBack={() => {
						navigate(-1);
					}}
					onDelete={() => {}}
				/>}
			>
				<Stack gap='md'>
					<Group gap='xs' mb='md'>
						<IconPresentation size={20} />
						<Text fw={600} size='lg'>{slideshow.name}</Text>
					</Group>

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
							<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
								<Text size='xs' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.slideshow.preview.vertical')}
								</Text>
								<SlideshowPreviewVertical slideshow={slideshow} />
							</Stack>

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
			</PageContainer>

			{/* Media Gallery Modal */}
			<MediaGalleryModal
				opened={galleryModalOpened}
				onClose={() => setGalleryModalOpened(false)}
				onSelectMedia={handleSelectMedia}
				selectedMediaIds={slideshowMedia.map((m) => m.id)}
			/>
		</>
	);
};
