import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import { AuthorizeDispatch, revokeRequestActions, selectDeleteRevokeRequest } from '@/appState';
import { RevokeRequest } from '@/features/revokeRequests/types';



// eslint-disable-next-line max-lines-per-function
export function useRevokeRequestDeleteHandler(
	revokeRequests: RevokeRequest[],
	dispatch: AuthorizeDispatch,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [requestToDelete, setRequestToDelete] = React.useState<RevokeRequest | null>(null);
	const deleteCommand = useMicroAppSelector(selectDeleteRevokeRequest);

	const handleDeleteRequest = React.useCallback((requestId: string) => {
		const request = revokeRequests.find((entry) => entry.id === requestId);
		if (!request) return;
		setRequestToDelete(request);
		setDeleteModalOpened(true);
	}, [revokeRequests]);

	const confirmDelete = React.useCallback(() => {
		if (!requestToDelete) return;
		dispatch(revokeRequestActions.deleteRevokeRequest({ id: requestToDelete.id }));
	}, [dispatch, requestToDelete]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			const targetName = requestToDelete?.target?.name || requestToDelete?.targetRef || '';
			const msg = translate('nikki.authorize.revoke_request.messages.delete_success', { name: targetName });
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			dispatch(revokeRequestActions.resetDeleteRevokeRequest());
			dispatch(revokeRequestActions.listRevokeRequests());
			setDeleteModalOpened(false);
			setRequestToDelete(null);
		}
		if (deleteCommand.status === 'error') {
			const errorMsg = deleteCommand.error ?? translate('nikki.general.errors.delete_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
			dispatch(revokeRequestActions.resetDeleteRevokeRequest());
		}
	}, [deleteCommand.status, deleteCommand.error, requestToDelete, notification, translate, dispatch]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRequestToDelete(null);
	}, []);

	return { deleteModalOpened, requestToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

