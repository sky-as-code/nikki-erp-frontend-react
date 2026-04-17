import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { Playlist } from '@/features/mediaPlaylist/types';

import { mediaPlaylistActions, VendingMachineDispatch } from '@/appState';
import { ControlPanel, type ViewMode } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	MediaPlaylistDetailDrawer,
	MediaPlaylistGridView,
	MediaPlaylistTable,
	type MediaPlaylistTableActions,
	mediaPlaylistSchema,
	useMediaPlaylistDetail,
	useMediaPlaylistFilter,
	useMediaPlaylistList,
} from '@/features/mediaPlaylist';


// eslint-disable-next-line max-lines-per-function
export const MediaPlaylistsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { filters, graph } = useMediaPlaylistFilter();
	const { playlists, isLoadingList, handleRefresh, pagination } = useMediaPlaylistList({ graph });
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Playlist>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { playlist: selectedPlaylist, isLoading: isLoadingDetail } = useMediaPlaylistDetail(selectedPlaylistId);

	const tableRows = useMemo(
		() =>
			(playlists || []).map((p: Playlist) => ({
				...p,
				mediaItems: p.mediaItems ?? null,
			})) as unknown as Record<string, unknown>[],
		[playlists],
	);

	const handleViewDetail = (playlistId: string) => {
		setSelectedPlaylistId(playlistId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedPlaylistId(undefined);
	};

	const handleOpenDeleteModal = (playlistId: string) => {
		const playlist = playlists?.find((p: Playlist) => p.id === playlistId);
		if (playlist) {
			configOpenModal(playlist);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			void dispatch(mediaPlaylistActions.deleteMediaPlaylist({ id: item.id })).then(() => {
				handleRefresh();
			});
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		console.log('Create media playlist');
	};

	const playlistTableActions: MediaPlaylistTableActions = {
		view: (p) => handleViewDetail(p.id),
		edit: (p) => navigate(`../media-playlist/playlists/${p.id}`),
		delete: (p) => handleOpenDeleteModal(p.id),
	};

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.mediaPlaylist.title'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				documentTitle={translate('nikki.vendingMachine.mediaPlaylist.title')}
				breadcrumbs={breadcrumbs}
				actionBar={
					<ControlPanel
						actions={[
							{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
							{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
						]}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<MediaPlaylistTable
						columns={['name', 'isArchived', 'mediaItems', 'actions']}
						data={tableRows}
						schema={mediaPlaylistSchema as ModelSchema}
						isLoading={isLoadingList}
						actions={playlistTableActions}
						pagination={pagination}
					/>
				) : (
					<MediaPlaylistGridView
						playlists={playlists || []}
						isLoading={isLoadingList}
						actions={playlistTableActions}
						pagination={pagination}
					/>
				)}
			</PageContainer>

			<ConfirmModal
				opened={isOpen}
				onClose={handleCloseModal}
				onConfirm={handleDeleteConfirm}
				title={translate('nikki.general.messages.delete_confirm')}
				message={
					item
						? translate('nikki.general.messages.delete_confirm_name', { name: item.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<MediaPlaylistDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				playlist={selectedPlaylist}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
