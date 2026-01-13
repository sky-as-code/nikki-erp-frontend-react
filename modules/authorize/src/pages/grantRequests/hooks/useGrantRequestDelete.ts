import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, grantRequestActions } from '@/appState';
import { GrantRequest } from '@/features/grantRequests/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useGrantRequestDeleteHandler(
	grantRequests: GrantRequest[],
	dispatch: AuthorizeDispatch,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [requestToDelete, setRequestToDelete] = React.useState<GrantRequest | null>(null);

	const handleDeleteRequest = React.useCallback((requestId: string) => {
		const request = grantRequests.find((entry) => entry.id === requestId);
		if (!request) return;
		setRequestToDelete(request);
		setDeleteModalOpened(true);
	}, [grantRequests]);

	const confirmDelete = useConfirmDeleteHandler(
		requestToDelete, dispatch, notification, translate, setDeleteModalOpened, setRequestToDelete,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRequestToDelete(null);
	}, []);

	return { deleteModalOpened, requestToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function useConfirmDeleteHandler(
	requestToDelete: GrantRequest | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setRequestToDelete: React.Dispatch<React.SetStateAction<GrantRequest | null>>,
) {
	return React.useCallback(() => {
		if (!requestToDelete) return;

		dispatch(grantRequestActions.deleteGrantRequest({ id: requestToDelete.id })).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				const targetName = requestToDelete.target?.name || requestToDelete.targetRef;
				const msg = translate('nikki.authorize.grant_request.messages.delete_success', { name: targetName });
				notification.showInfo(msg, translate('nikki.general.messages.success'));
				dispatch(grantRequestActions.listGrantRequests());
			}
			else {
				const errorMsg = typeof result.payload === 'string'
					? result.payload
					: translate('nikki.general.errors.delete_failed');
				notification.showError(errorMsg, translate('nikki.general.messages.error'));
			}
			setDeleteModalOpened(false);
			setRequestToDelete(null);
		});
	}, [dispatch, requestToDelete, notification, translate, setDeleteModalOpened, setRequestToDelete]);
}

