/* eslint-disable max-lines-per-function */
import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconAd } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { DetailControlPanel } from '@/components/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { useAdDetail } from '@/features/ads';
import { AdPreviewHorizontal } from '@/features/ads/components/AdPreviewHorizontal';
import { AdPreviewVertical } from '@/features/ads/components/AdPreviewVertical';
import { MediaGalleryModal } from '@/features/ads/components/MediaGalleryModal';
import { MediaList } from '@/features/ads/components/MediaList';
import { AdMedia, GalleryMedia } from '@/features/ads/types';


export const AdDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { ad, isLoading } = useAdDetail(id);
	const [galleryModalOpened, setGalleryModalOpened] = useState(false);
	const [adMedia, setAdMedia] = useState<AdMedia[]>(ad?.media || []);
	const navigate = useNavigate();

	// Update adMedia when ad changes
	React.useEffect(() => {
		if (ad) {
			setAdMedia(ad.media || []);
		}
	}, [ad]);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			expired: { color: 'red', label: translate('nikki.vendingMachine.ads.status.expired') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const handleAddMedia = () => {
		setGalleryModalOpened(true);
	};

	const handleSelectMedia = (selectedMedia: GalleryMedia[]) => {
		const newMedia: AdMedia[] = selectedMedia.map((item, index) => ({
			id: item.id,
			code: item.code,
			name: item.name,
			type: item.type,
			url: item.url,
			thumbnailUrl: item.thumbnailUrl,
			duration: item.duration,
			order: adMedia.length + index + 1,
		}));
		setAdMedia([...adMedia, ...newMedia]);
	};

	const handleRemoveMedia = (mediaId: string) => {
		setAdMedia(adMedia.filter((m) => m.id !== mediaId).map((m, index) => ({ ...m, order: index + 1 })));
	};

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.ads.title'), href: '../ads' },
		{ title: ad?.name || translate('nikki.vendingMachine.ads.detail.title'), href: '#' },
	];

	if (isLoading || !ad) {
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
						<IconAd size={20} />
						<Text fw={600} size='lg'>{ad.name}</Text>
					</Group>

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.ads.fields.code')}
						</Text>
						<Text size='sm' fw={500}>{ad.code}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.ads.fields.name')}
						</Text>
						<Text size='sm'>{ad.name}</Text>
					</div>

					{ad.description && (
						<>
							<Divider />
							<div>
								<Text size='sm' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.ads.fields.description')}
								</Text>
								<Text size='sm'>{ad.description}</Text>
							</div>
						</>
					)}

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.ads.fields.status')}
						</Text>
						{getStatusBadge(ad.status)}
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.ads.fields.startDate')}
						</Text>
						<Text size='sm'>{new Date(ad.startDate).toLocaleString()}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.ads.fields.endDate')}
						</Text>
						<Text size='sm'>{new Date(ad.endDate).toLocaleString()}</Text>
					</div>

					<Divider />

					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.ads.fields.createdAt')}
						</Text>
						<Text size='sm'>{new Date(ad.createdAt).toLocaleString()}</Text>
					</div>

					<Divider />

					{/* Media List Section */}
					<div>
						<MediaList
							media={adMedia}
							onAddMedia={handleAddMedia}
							onRemoveMedia={handleRemoveMedia}
						/>
					</div>

					<Divider />

					{/* Preview Section */}
					<div>
						<Text size='sm' c='dimmed' mb='md' fw={500}>
							{translate('nikki.vendingMachine.ads.preview.title')}
						</Text>
						<Stack gap='lg'>
							{/* Vertical Preview (9:16) - Full screen ad for idle/waiting screen */}
							<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
								<Text size='xs' c='dimmed' mb='xs'>
									{translate('nikki.vendingMachine.ads.preview.vertical')}
								</Text>
								<AdPreviewVertical ad={ad} />
							</Stack>

							{/* Horizontal Preview - Ad in footer area */}

							<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
								<Text size='xs' c='dimmed'>
									{translate('nikki.vendingMachine.ads.preview.horizontal')}
								</Text>
								<AdPreviewHorizontal ad={ad} />
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
				selectedMediaIds={adMedia.map((m) => m.id)}
			/>
		</>
	);
};
