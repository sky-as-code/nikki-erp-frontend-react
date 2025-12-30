import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, resourceActions } from '@/appState';
import { Resource } from '@/features/resources';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


function handleDeleteResult(
	result: Awaited<ReturnType<ReturnType<typeof resourceActions.deleteResource>>>,
	resourceName: string,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setResourceToDelete: React.Dispatch<React.SetStateAction<Resource | null>>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.resource.messages.delete_success', { name: resourceName }),
			translate('nikki.general.messages.success'),
		);
		dispatch(resourceActions.listResources());
	}
	else {
		const errorMessage = typeof result.payload === 'string'
			? result.payload
			: translate('nikki.general.errors.delete_failed');
		notification.showError(errorMessage, translate('nikki.general.messages.error'));
	}
	setDeleteModalOpened(false);
	setResourceToDelete(null);
}

function useConfirmDelete(
	resourceToDelete: Resource | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setResourceToDelete: React.Dispatch<React.SetStateAction<Resource | null>>,
) {
	return React.useCallback(() => {
		if (!resourceToDelete) return;
		dispatch(resourceActions.deleteResource({
			name: resourceToDelete.name,
		})).then((result) => {
			handleDeleteResult(
				result,
				resourceToDelete.name,
				dispatch,
				notification,
				translate,
				setDeleteModalOpened,
				setResourceToDelete,
			);
		});
	}, [dispatch, resourceToDelete, notification, translate, setDeleteModalOpened, setResourceToDelete]);
}

function useResourceDeleteHandler(resources: Resource[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null);

	const handleDeleteRequest = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) return;
		setResourceToDelete(resource);
		setDeleteModalOpened(true);
	}, [resources]);

	const confirmDelete = useConfirmDelete(
		resourceToDelete,
		dispatch,
		notification,
		translate,
		setDeleteModalOpened,
		setResourceToDelete,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setResourceToDelete(null);
	}, []);

	return { deleteModalOpened, resourceToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

export const useResourceDelete = {
	handler: useResourceDeleteHandler,
};
