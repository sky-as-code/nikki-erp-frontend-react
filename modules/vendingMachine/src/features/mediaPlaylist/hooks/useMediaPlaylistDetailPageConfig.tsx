/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	IconArchive,
	IconArrowLeft,
	IconDeviceFloppy,
	IconEdit,
	IconRestore,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { mediaPlaylistActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';

import { usePlaylistArchive } from './usePlaylistArchive';
import { usePlaylistDelete } from './usePlaylistDelete';

import type { Playlist } from '../types';
import type { UseMediaPlaylistDetailPageConfigReturn } from './useMediaPlaylistDetailPageConfig.types';




function buildToolbarActions(
	isEditing: boolean,
	isSubmitting: boolean,
	playlist: Playlist,
	translate: ReturnType<typeof useTranslation>['t'],
	onEdit: () => void,
	onSave: () => void,
	onCancel: () => void,
	onDelete: () => void,
	onArchive: () => void,
	onRestore: () => void,
): ControlPanelProps['actions'] {
	const primary = !isEditing
		? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: onEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}]
		: [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: onSave,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: onCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}];

	const archiveAction = playlist.isArchived
		? {
			label: translate('nikki.general.actions.restore'),
			leftSection: <IconRestore size={16} />,
			onClick: onRestore,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
		}
		: {
			label: translate('nikki.general.actions.archive'),
			leftSection: <IconArchive size={16} />,
			onClick: onArchive,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
			color: 'orange' as const,
		};

	return [
		...primary,
		archiveAction,
		{
			label: translate('nikki.general.actions.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: onDelete,
			type: 'button' as const,
			variant: 'outline' as const,
			color: 'red' as const,
			disabled: isSubmitting || isEditing,
		},
	];
}

export type UseMediaPlaylistDetailPageConfigParams = {
	playlist?: Playlist;
	onSave: () => void | Promise<void>;
	isSubmitting: boolean;
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
};

export function useMediaPlaylistDetailPageConfig({
	playlist,
	onSave,
	isSubmitting,
	isEditing,
	setIsEditing,
}: UseMediaPlaylistDetailPageConfigParams): UseMediaPlaylistDetailPageConfigReturn {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	const idFromPath = pathname.split('/').pop() ?? '';
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [formResetNonce, setFormResetNonce] = useState(0);

	const onArchiveSuccess = useCallback(() => {
		if (playlist?.id) {
			dispatch(mediaPlaylistActions.getMediaPlaylist(playlist.id));
		}
	}, [playlist?.id, dispatch]);

	const {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal,
		isOpenArchiveModal,
		pendingArchive,
	} = usePlaylistArchive({ onArchiveSuccess });

	const {
		handleDelete: dispatchDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		playlistToDelete,
	} = usePlaylistDelete({ onDeleteSuccess: () => navigate('..') });

	const onSaveClick = useCallback(() => {
		void onSave();
	}, [onSave]);

	const onEditClick = useCallback(() => setIsEditing(true), [setIsEditing]);
	const onCancelClick = useCallback(() => {
		setFormResetNonce((n) => n + 1);
		setIsEditing(false);
	}, [setIsEditing]);

	const onDeleteClick = useCallback(() => {
		if (playlist) {
			handleOpenDeleteModal(playlist);
		}
	}, [playlist, handleOpenDeleteModal]);

	const confirmDelete = useCallback(() => {
		if (playlist) {
			dispatchDelete(playlist.id);
		}
		handleCloseDeleteModal();
	}, [dispatchDelete, playlist, handleCloseDeleteModal]);

	const onArchiveClick = useCallback(() => {
		if (playlist) {
			handleOpenArchiveModal(playlist);
		}
	}, [playlist, handleOpenArchiveModal]);

	const onRestoreClick = useCallback(() => {
		if (playlist) {
			handleOpenRestoreModal(playlist);
		}
	}, [playlist, handleOpenRestoreModal]);

	const panelActions = useMemo(() => {
		if (!playlist) {
			return [];
		}
		return buildToolbarActions(
			isEditing,
			isSubmitting,
			playlist,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onDeleteClick,
			onArchiveClick,
			onRestoreClick,
		);
	}, [
		playlist, isEditing, isSubmitting, translate,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick, onArchiveClick, onRestoreClick,
	]);

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
			{ title: translate('nikki.vendingMachine.mediaPlaylist.title'), href: '../media-playlist/playlists' },
			{
				title:
					playlist?.name
					?? (idFromPath ? idFromPath : translate('nikki.vendingMachine.mediaPlaylist.detail.title')),
				href: '#',
			},
		],
		[translate, playlist?.name, idFromPath],
	);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../media-playlist/playlists'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		},
		...(panelActions ?? []),
	], [translate, navigate, panelActions]);

	return useMemo(() => ({
		breadcrumbs,
		actions,
		formResetNonce,
		isEditing,
		setIsEditing,
		isSubmitting,
		onSaveClick,
		closeDeleteModal: handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
		playlistForDelete: playlistToDelete,
	}), [
		breadcrumbs,
		actions,
		formResetNonce,
		isSubmitting,
		onSaveClick,
		handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
		playlistToDelete,
	]);
}

export type { UseMediaPlaylistDetailPageConfigReturn } from './useMediaPlaylistDetailPageConfig.types';
