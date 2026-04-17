import { Box, Divider, Stack, Text } from '@mantine/core';
import { IconPlaylist } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { PreviewDrawer } from '@/components/PreviewDrawer';

import { mediaPlaylistService } from '../../mediaPlaylistService';
import { ObjectFit, type GalleryMedia, type Playlist, type PlaylistMediaRow } from '../../types';
import { MediaGalleryModal } from '../MediaGalleryModal';
import { MediaList } from '../MediaList';


export interface MediaPlaylistDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	playlist: Playlist | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const MediaPlaylistDetailDrawer: React.FC<MediaPlaylistDetailDrawerProps> = ({
	opened,
	onClose,
	playlist: slideshow,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [galleryModalOpened, setGalleryModalOpened] = useState(false);
	const [playlistMedia, setPlaylistMedia] = useState<PlaylistMediaRow[]>([]);

	React.useEffect(() => {
		if (!slideshow?.id) {
			setPlaylistMedia([]);
			return;
		}
		let cancelled = false;
		mediaPlaylistService.loadPlaylistMediaRows(slideshow.id).then((rows) => {
			if (!cancelled) setPlaylistMedia(rows);
		});
		return () => {
			cancelled = true;
		};
	}, [slideshow?.id]);

	const handleAddMedia = () => {
		setGalleryModalOpened(true);
	};

	const handleSelectMedia = (selectedMedia: GalleryMedia[]) => {
		const newMedia: PlaylistMediaRow[] = selectedMedia.map((item, index) => ({
			id: `gallery-${item.id}-${index}`,
			kioskMediaRef: item.id,
			name: item.name,
			type: item.type,
			url: mediaPlaylistService.getKioskMediaStreamUrl(item.id),
			thumbnailUrl: item.thumbnailUrl,
			order: playlistMedia.length + index + 1,
			durationSec: item.duration,
			objectFit: ObjectFit.CONTAIN,
		}));
		setPlaylistMedia([...playlistMedia, ...newMedia]);
	};

	const handleRemoveMedia = (mediaId: string) => {
		setPlaylistMedia(playlistMedia.filter(
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
				subtitle: <ArchivedStatusBadge isArchived={!!slideshow?.isArchived} />,
				avatar: <IconPlaylist size={30} />,
			}}
			onViewDetails={() => {
				if (slideshow?.id) {
					navigate(`../media-playlist/playlists/${slideshow.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!slideshow && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='sm'>
				<Box>
					<Text size='sm' c='dimmed' mb={3}>
						{translate('nikki.vendingMachine.mediaPlaylist.fields.name')}
					</Text>
					<Text size='sm' fw={500}>{slideshow?.name}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb={3}>
						{translate('nikki.vendingMachine.mediaPlaylist.fields.createdAt')}
					</Text>
					<Text size='sm'>{slideshow?.createdAt ? new Date(slideshow.createdAt).toLocaleString() : '—'}</Text>
				</Box>

				<Divider my={'lg'} />

				<MediaList
					maxHeight={350}
					media={playlistMedia}
					onAddMedia={handleAddMedia}
					onRemoveMedia={handleRemoveMedia}
					onMediaChange={setPlaylistMedia}
				/>
			</Stack>

			<MediaGalleryModal
				opened={galleryModalOpened}
				onClose={() => setGalleryModalOpened(false)}
				onSelectMedia={handleSelectMedia}
				selectedMediaIds={playlistMedia.map((m) => m.id)}
			/>
		</PreviewDrawer>
	);
};
