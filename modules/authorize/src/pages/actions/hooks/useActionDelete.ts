import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, actionActions } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function handleDeleteResult(
	result: Awaited<ReturnType<ReturnType<typeof actionActions.deleteAction>>>,
	actionName: string,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setActionToDelete: React.Dispatch<React.SetStateAction<Action | null>>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.action.messages.delete_success', { name: actionName }),
			translate('nikki.general.messages.success'),
		);
		dispatch(actionActions.listActions(undefined));
	}
	else {
		const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.delete_failed');
		notification.showError(errorMessage, translate('nikki.general.messages.error'));
	}
	setDeleteModalOpened(false);
	setActionToDelete(null);
}

function useConfirmDelete(
	actionToDelete: Action | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setActionToDelete: React.Dispatch<React.SetStateAction<Action | null>>,
) {
	return React.useCallback(() => {
		if (!actionToDelete) return;
		dispatch(actionActions.deleteAction({
			actionId: actionToDelete.id,
		})).then((result) => {
			handleDeleteResult(
				result,
				actionToDelete.name,
				dispatch,
				notification,
				translate,
				setDeleteModalOpened,
				setActionToDelete,
			);
		});
	}, [dispatch, actionToDelete, notification, translate, setDeleteModalOpened, setActionToDelete]);
}

export function useActionDeleteHandler(actions: Action[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [actionToDelete, setActionToDelete] = React.useState<Action | null>(null);

	const handleDeleteRequest = React.useCallback((actionId: string) => {
		const action = actions.find((entry) => entry.id === actionId);
		if (!action) return;
		setActionToDelete(action);
		setDeleteModalOpened(true);
	}, [actions]);

	const confirmDelete = useConfirmDelete(
		actionToDelete,
		dispatch,
		notification,
		translate,
		setDeleteModalOpened,
		setActionToDelete,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setActionToDelete(null);
	}, []);

	return { deleteModalOpened, actionToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

