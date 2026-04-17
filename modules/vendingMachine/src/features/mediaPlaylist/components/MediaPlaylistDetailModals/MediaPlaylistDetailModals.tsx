import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { UseMediaPlaylistDetailPageConfigReturn } from '../../hooks/useMediaPlaylistDetailPageConfig.types';
import type { Playlist } from '@/features/mediaPlaylist/types';



type ModalProps = Pick<
	UseMediaPlaylistDetailPageConfigReturn,
	| 'closeDeleteModal'
	| 'confirmDelete'
	| 'isOpenDeleteModal'
	| 'isOpenArchiveModal'
	| 'pendingArchive'
	| 'handleConfirmArchive'
	| 'handleCloseArchiveModal'
> & { playlist: Playlist };

export const MediaPlaylistDetailModals: React.FC<ModalProps> = ({
	playlist,
	closeDeleteModal,
	confirmDelete,
	isOpenDeleteModal,
	isOpenArchiveModal,
	pendingArchive,
	handleConfirmArchive,
	handleCloseArchiveModal,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={
					<Trans
						i18nKey='nikki.vendingMachine.mediaPlaylist.messages.delete_confirm'
						values={{ name: playlist.name }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<ConfirmModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				title={pendingArchive?.targetArchived
					? t('nikki.vendingMachine.mediaPlaylist.messages.archive_modal_title')
					: t('nikki.vendingMachine.mediaPlaylist.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'nikki.vendingMachine.mediaPlaylist.messages.archive_confirm'
							: 'nikki.vendingMachine.mediaPlaylist.messages.restore_confirm'}
						values={{ name: pendingArchive?.playlist?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={pendingArchive?.targetArchived
					? t('nikki.general.actions.archive')
					: t('nikki.general.actions.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>
		</>
	);
};
