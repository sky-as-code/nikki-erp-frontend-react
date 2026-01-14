import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import { AuthorizeDispatch, resourceActions, selectDeleteResource } from '@/appState';
import { Resource } from '@/features/resources';



function useConfirmDelete(
	resourceToDelete: Resource | null,
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback(() => {
		if (!resourceToDelete) return;
		dispatch(resourceActions.deleteResource({
			name: resourceToDelete.name,
		}));
	}, [dispatch, resourceToDelete]);
}

// eslint-disable-next-line max-lines-per-function
function useResourceDeleteHandler(resources: Resource[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null);

	const deleteCommand = useMicroAppSelector(selectDeleteResource);

	const handleDeleteRequest = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) return;
		setResourceToDelete(resource);
		setDeleteModalOpened(true);
	}, [resources]);

	const confirmDelete = useConfirmDelete(
		resourceToDelete,
		dispatch,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setResourceToDelete(null);
	}, []);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.delete_success', { name: resourceToDelete?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(resourceActions.resetDeleteResource());
			dispatch(resourceActions.listResources());
			setDeleteModalOpened(false);
			setResourceToDelete(null);
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				deleteCommand.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(resourceActions.resetDeleteResource());
		}
	}, [deleteCommand.status, deleteCommand.error, resourceToDelete, notification, translate, dispatch]);

	return { deleteModalOpened, resourceToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

export const useResourceDelete = {
	handler: useResourceDeleteHandler,
};
