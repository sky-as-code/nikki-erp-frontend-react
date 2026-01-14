import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';

import { AuthorizeDispatch, actionActions, selectDeleteAction } from '@/appState';


function useConfirmDelete(
	actionToDelete: Action | null,
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback(() => {
		if (!actionToDelete) return;
		dispatch(actionActions.deleteAction({
			actionId: actionToDelete.id,
		}));
	}, [dispatch, actionToDelete]);
}

// eslint-disable-next-line max-lines-per-function
export function useActionDeleteHandler(actions: Action[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [actionToDelete, setActionToDelete] = React.useState<Action | null>(null);

	const deleteCommand = useMicroAppSelector(selectDeleteAction);

	const handleDeleteRequest = React.useCallback((actionId: string) => {
		const action = actions.find((entry) => entry.id === actionId);
		if (!action) return;
		setActionToDelete(action);
		setDeleteModalOpened(true);
	}, [actions]);

	const confirmDelete = useConfirmDelete(
		actionToDelete,
		dispatch,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setActionToDelete(null);
	}, []);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.action.messages.delete_success', { name: actionToDelete?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(actionActions.resetDeleteAction());
			dispatch(actionActions.listActions(undefined));
			setDeleteModalOpened(false);
			setActionToDelete(null);
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				deleteCommand.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(actionActions.resetDeleteAction());
		}
	}, [deleteCommand.status, deleteCommand.error, actionToDelete, notification, translate, dispatch]);

	return { deleteModalOpened, actionToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

