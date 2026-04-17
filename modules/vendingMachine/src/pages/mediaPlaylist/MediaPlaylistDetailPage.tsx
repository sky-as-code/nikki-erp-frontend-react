/* eslint-disable max-lines-per-function */
import { Avatar, Box, Center, Divider, Grid, Group, Stack, Text, TextInput } from '@mantine/core';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconPlaylist } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { mediaPlaylistActions, VendingMachineDispatch } from '@/appState';
import { ControlPanel } from '@/components';
import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { PageContainer } from '@/components/PageContainer';
import { MediaGalleryModal } from '@/features/mediaPlaylist/components/MediaGalleryModal';
import { MediaList } from '@/features/mediaPlaylist/components/MediaList';
import { MediaPlaylistDetailModals } from '@/features/mediaPlaylist/components/MediaPlaylistDetailModals/MediaPlaylistDetailModals';
import { MediaPlaylistPreviewHorizontal } from '@/features/mediaPlaylist/components/MediaPlaylistPreviewHorizontal';
import { MediaPlaylistPreviewVertical } from '@/features/mediaPlaylist/components/MediaPlaylistPreviewVertical';
import {
	PlaylistDurationTimeline,
	type TrialPlaybackState,
} from '@/features/mediaPlaylist/components/PlaylistDurationTimeline';
import { useMediaPlaylistDetail, useMediaPlaylistDetailPageConfig } from '@/features/mediaPlaylist/hooks';
import { usePlaylistEdit } from '@/features/mediaPlaylist/hooks/usePlaylistEdit';
import {
	mediaPlaylistService,
	playlistMediaRowsToReplaceItems,
} from '@/features/mediaPlaylist/mediaPlaylistService';
import { ObjectFit, type GalleryMedia, type PlaylistMediaRow } from '@/features/mediaPlaylist/types';



export const MediaPlaylistDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { id } = useParams<{ id: string }>();
	const { playlist, isLoading } = useMediaPlaylistDetail(id);
	const [galleryModalOpened, setGalleryModalOpened] = useState(false);
	const [playlistMedia, setPlaylistMedia] = useState<PlaylistMediaRow[]>([]);
	const [trialClip, setTrialClip] = useState<PlaylistMediaRow | null>(null);
	const [draftName, setDraftName] = useState('');
	const [isSavingMedia, setIsSavingMedia] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [previewLayout, setPreviewLayout] = useState<'vertical' | 'horizontal'>('vertical');

	const reloadMediaRows = useCallback(async (playlistId: string) => {
		const rows = await mediaPlaylistService.loadPlaylistMediaRows(playlistId);
		setPlaylistMedia(rows);
	}, []);

	const {
		handleSubmit: submitPlaylistUpdate,
		isSubmitting: isUpdatingName,
	} = usePlaylistEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (id) {
				void reloadMediaRows(id);
				dispatch(mediaPlaylistActions.getMediaPlaylist(id));
			}
		},
	});

	const handlePersist = useCallback(async () => {
		if (!playlist?.id) return;
		setIsSavingMedia(true);
		try {
			await mediaPlaylistService.replacePlaylistMedia(
				playlist.id,
				playlistMediaRowsToReplaceItems(playlistMedia),
			);
			const latest = await mediaPlaylistService.getMediaPlaylist(playlist.id);
			if (!latest) return;
			const nameTrim = draftName.trim();
			if (nameTrim !== latest.name) {
				if (!nameTrim) {
					notification.showError(
						translate('nikki.vendingMachine.mediaPlaylist.messages.name_required'),
						translate('nikki.general.messages.error'),
					);
					return;
				}
				submitPlaylistUpdate({ id: latest.id, etag: latest.etag, name: nameTrim });
				return;
			}
			dispatch(mediaPlaylistActions.getMediaPlaylist(latest.id));
			await reloadMediaRows(latest.id);
			setIsEditing(false);
			notification.showInfo(
				translate('nikki.vendingMachine.mediaPlaylist.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
		}
		catch (e) {
			const message = e instanceof Error ? e.message : translate('nikki.general.errors.update_failed');
			notification.showError(message, translate('nikki.general.messages.error'));
		}
		finally {
			setIsSavingMedia(false);
		}
	}, [
		playlist?.id, playlistMedia, draftName, dispatch, notification, translate,
		reloadMediaRows, submitPlaylistUpdate,
	]);

	const isSubmittingToolbar = isSavingMedia || isUpdatingName;

	const {
		breadcrumbs,
		actions,
		formResetNonce,
		closeDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
	} = useMediaPlaylistDetailPageConfig({
		playlist,
		onSave: handlePersist,
		isSubmitting: isSubmittingToolbar,
		isEditing,
		setIsEditing,
	});

	useEffect(() => {
		setDraftName(playlist?.name ?? '');
	}, [playlist?.id, playlist?.name, formResetNonce]);

	useEffect(() => {
		if (!playlist?.id) {
			setPlaylistMedia([]);
			return;
		}
		let cancelled = false;
		mediaPlaylistService.loadPlaylistMediaRows(playlist.id).then((rows) => {
			if (!cancelled) setPlaylistMedia(rows);
		});
		return () => {
			cancelled = true;
		};
	}, [playlist?.id]);

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
		setPlaylistMedia(playlistMedia.filter((m) => m.id !== mediaId).map((m, index) => ({ ...m, order: index + 1 })));
	};

	const playlistMediaByOrder = useMemo(
		() => [...playlistMedia].sort((a, b) => a.order - b.order),
		[playlistMedia],
	);

	const firstPreviewUrl = playlistMediaByOrder[0]?.url;

	const handleTrialPlaybackChange = useCallback((state: TrialPlaybackState) => {
		setTrialClip(state.trialPlaying ? state.currentItem : null);
	}, []);

	const previewClip = trialClip ?? playlistMediaByOrder[0];
	const previewUrl = previewClip?.url ?? firstPreviewUrl;
	const previewMediaType: 'image' | 'video' = previewClip?.type ?? 'image';

	const readOnly = !isEditing;

	return (
		<>
			<PageContainer
				documentTitle={playlist?.name ?? translate('nikki.vendingMachine.mediaPlaylist.detail.title')}
				breadcrumbs={breadcrumbs}
				sections={[<ControlPanel key='media-playlist-detail-actions' actions={actions} />]}
				isLoading={isLoading && !playlist}
				isNotFound={!playlist && !isLoading}
				notFoundContent={
					<Text c='dimmed'>{translate('nikki.general.messages.not_found')}</Text>
				}
			>
				{playlist ? (
					<Grid columns={12} gutter='md' align='flex-start'>
						<Grid.Col span={{ base: 12, md: 7 }}>
							<Stack px={0} bdrs='md' justify={'space-between'} h={{ base: 'max-content', md: 700 }} gap={'sm'}>
								<Stack gap={'sm'}>
									<Group gap='xs' align='start'>
										<Avatar size={60} radius='md' src={''}>
											<IconPlaylist size={30} />
										</Avatar>
										<Box style={{ flex: 1, minWidth: 0 }}>
											{isEditing ? (
												<TextInput
													key={formResetNonce}
													value={draftName}
													onChange={(e) => setDraftName(e.currentTarget.value)}
													size='sm'
													mb={4}
												/>
											) : (
												<Text fw={600} size='lg' lh={1} mb={3}>{playlist.name}</Text>
											)}
											<ArchivedStatusBadge isArchived={!!playlist.isArchived} />
										</Box>
									</Group>

									<Divider />

									<MediaList
										maxHeight={350}
										media={playlistMedia}
										onAddMedia={handleAddMedia}
										onRemoveMedia={handleRemoveMedia}
										onMediaChange={setPlaylistMedia}
										readOnly={readOnly}
									/>
								</Stack>

								<Divider />
								<PlaylistDurationTimeline
									previewLayout={previewLayout}
									setPreviewLayout={setPreviewLayout}
									media={playlistMedia}
									onMediaChange={setPlaylistMedia}
									onTrialPlaybackChange={handleTrialPlaybackChange}
									readOnly={readOnly}
								/>
							</Stack>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 5 }}>
							<Center h={{ base: 'auto', sm: 700 }} bg='gray.0' bdrs='md' p={'xs'}>
								{previewLayout === 'vertical' ? (
									<MediaPlaylistPreviewVertical
										playlist={playlist}
										imageUrl={previewUrl}
										mediaType={previewMediaType}
										mediaObjectFit={previewClip?.objectFit}
									/>
								) : (
									<MediaPlaylistPreviewHorizontal
										playlist={playlist}
										imageUrl={previewUrl}
										mediaType={previewMediaType}
										mediaObjectFit={previewClip?.objectFit}
									/>
								)}
							</Center>
						</Grid.Col>
					</Grid>
				) : null}
			</PageContainer>

			<MediaGalleryModal
				opened={galleryModalOpened}
				onClose={() => setGalleryModalOpened(false)}
				onSelectMedia={handleSelectMedia}
				selectedMediaIds={playlistMedia.map((m) => m.id)}
			/>

			{playlist ? (
				<MediaPlaylistDetailModals
					playlist={playlist}
					closeDeleteModal={closeDeleteModal}
					confirmDelete={confirmDelete}
					isOpenDeleteModal={isOpenDeleteModal}
					isOpenArchiveModal={isOpenArchiveModal}
					pendingArchive={pendingArchive}
					handleConfirmArchive={handleConfirmArchive}
					handleCloseArchiveModal={handleCloseArchiveModal}
				/>
			) : null}
		</>
	);
};
