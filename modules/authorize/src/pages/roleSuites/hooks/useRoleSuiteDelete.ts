import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, roleSuiteActions } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { RoleSuite } from '@/features/roleSuites';



export function useRoleSuiteDeleteHandler(
	roleSuites: RoleSuite[],
	dispatch: AuthorizeDispatch,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [roleSuiteToDelete, setRoleSuiteToDelete] = React.useState<RoleSuite | null>(null);

	const handleDeleteRequest = React.useCallback((roleSuiteId: string) => {
		const roleSuite = roleSuites.find((entry) => entry.id === roleSuiteId);
		if (!roleSuite) return;
		setRoleSuiteToDelete(roleSuite);
		setDeleteModalOpened(true);
	}, [roleSuites]);

	const confirmDelete = useConfirmDeleteHandler(
		roleSuiteToDelete,
		dispatch,
		notification,
		translate,
		setDeleteModalOpened,
		setRoleSuiteToDelete,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRoleSuiteToDelete(null);
	}, []);

	return { deleteModalOpened, roleSuiteToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function useConfirmDeleteHandler(
	roleSuiteToDelete: RoleSuite | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setRoleSuiteToDelete: React.Dispatch<React.SetStateAction<RoleSuite | null>>,
) {
	return React.useCallback(() => {
		if (!roleSuiteToDelete) return;

		dispatch(roleSuiteActions.deleteRoleSuite({ id: roleSuiteToDelete.id })).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				const msg = translate('nikki.authorize.role_suite.messages.delete_success', {
					name: roleSuiteToDelete.name,
				});
				notification.showInfo(msg, translate('nikki.general.messages.success'));
				dispatch(roleSuiteActions.listRoleSuites());
			}
			else {
				const errorMsg = typeof result.payload === 'string'
					? result.payload
					: translate('nikki.general.errors.delete_failed');
				notification.showError(errorMsg, translate('nikki.general.messages.error'));
			}
			setDeleteModalOpened(false);
			setRoleSuiteToDelete(null);
		});
	}, [dispatch, roleSuiteToDelete, notification, translate, setDeleteModalOpened, setRoleSuiteToDelete]);
}

