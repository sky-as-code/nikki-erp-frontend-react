import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Playlist } from '../types';

import {
	mediaPlaylistActions,
	selectDeleteMediaPlaylist,
	VendingMachineDispatch,
} from '@/appState';




export interface UsePlaylistDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}

function useDeleteOutcomeSync(
	deleteState: ReduxActionState<void>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleCloseDeleteModal: () => void,
	onDeleteSuccess: () => void,
	onDeleteError: () => void,
) {
	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.mediaPlaylist.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			handleCloseDeleteModal();
			onDeleteSuccess();
			dispatch(mediaPlaylistActions.resetDeleteMediaPlaylist());
			return;
		}
		if (deleteState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			handleCloseDeleteModal();
			onDeleteError();
			dispatch(mediaPlaylistActions.resetDeleteMediaPlaylist());
		}
	}, [deleteState, dispatch, notification, translate, handleCloseDeleteModal, onDeleteSuccess, onDeleteError]);
}

export const usePlaylistDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UsePlaylistDeleteProps = {
	onDeleteSuccess: () => {},
	onDeleteError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedDeleteRequestIdRef = React.useRef<string | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteMediaPlaylist);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [playlistToDelete, setPlaylistToDelete] = React.useState<Playlist | null>(null);

	const handleOpenDeleteModal = React.useCallback((playlistItem: Playlist) => {
		setPlaylistToDelete(playlistItem);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setPlaylistToDelete(null);
	}, []);

	const handleDelete = React.useCallback((playlistId: string) => {
		const pendingAction = dispatch(mediaPlaylistActions.deleteMediaPlaylist({ id: playlistId }));
		dispatchedDeleteRequestIdRef.current = pendingAction.requestId;
	}, [dispatch]);

	useDeleteOutcomeSync(
		deleteState,
		dispatchedDeleteRequestIdRef,
		dispatch,
		notification,
		translate,
		handleCloseDeleteModal,
		onDeleteSuccess,
		onDeleteError,
	);

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		playlistToDelete,
	};
};
