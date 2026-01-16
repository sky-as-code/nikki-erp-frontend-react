import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, grantRequestActions, selectDeleteGrantRequest } from '@/appState';
import { GrantRequest } from '@/features/grantRequests/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


// eslint-disable-next-line max-lines-per-function
export function useGrantRequestDelete(
	grantRequests: GrantRequest[],
	dispatch: AuthorizeDispatch,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [requestToDelete, setRequestToDelete] = React.useState<GrantRequest | null>(null);

	const deleteCommand = useMicroAppSelector(selectDeleteGrantRequest);

	const handleDeleteRequest = React.useCallback((requestId: string) => {
		const request = grantRequests.find((entry) => entry.id === requestId);
		if (!request) return;
		setRequestToDelete(request);
		setDeleteModalOpened(true);
	}, [grantRequests]);

	const confirmDelete = useConfirmDeleteHandler(requestToDelete, dispatch);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRequestToDelete(null);
	}, []);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			const targetName = requestToDelete?.target?.name || requestToDelete?.targetRef;
			const msg = translate('nikki.authorize.grant_request.messages.delete_success', { name: targetName });
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			dispatch(grantRequestActions.resetDeleteGrantRequest());
			dispatch(grantRequestActions.listGrantRequests());
			setDeleteModalOpened(false);
			setRequestToDelete(null);
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				deleteCommand.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(grantRequestActions.resetDeleteGrantRequest());
		}
	}, [deleteCommand.status, deleteCommand.error, requestToDelete, notification, translate, dispatch]);

	return { deleteModalOpened, requestToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function useConfirmDeleteHandler(
	requestToDelete: GrantRequest | null,
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback(() => {
		if (!requestToDelete) return;
		dispatch(grantRequestActions.deleteGrantRequest({ id: requestToDelete.id }));
	}, [dispatch, requestToDelete]);
}

