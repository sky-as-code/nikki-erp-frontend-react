import { AuthorizeDispatch, roleSuiteActions, selectDeleteRoleSuite } from '@/appState';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';



import type { RoleSuite } from '@/features/roleSuites';



export function useRoleSuiteDelete(
	roleSuites: RoleSuite[],
	dispatch: AuthorizeDispatch,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [roleSuiteToDelete, setRoleSuiteToDelete] = React.useState<RoleSuite | null>(null);
	const deleteCommand = useMicroAppSelector(selectDeleteRoleSuite);

	const handleDeleteRequest = React.useCallback((roleSuiteId: string) => {
		const roleSuite = roleSuites.find((entry) => entry.id === roleSuiteId);
		if (!roleSuite) return;
		setRoleSuiteToDelete(roleSuite);
		setDeleteModalOpened(true);
	}, [roleSuites]);

	const confirmDelete = React.useCallback(() => {
		if (!roleSuiteToDelete) return;
		dispatch(roleSuiteActions.deleteRoleSuite({ id: roleSuiteToDelete.id }));
	}, [dispatch, roleSuiteToDelete]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			const msg = translate('nikki.authorize.role_suite.messages.delete_success', {
				name: roleSuiteToDelete?.name,
			});
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			dispatch(roleSuiteActions.resetDeleteRoleSuite());
			dispatch(roleSuiteActions.listRoleSuites());
			setDeleteModalOpened(false);
			setRoleSuiteToDelete(null);
		}
		if (deleteCommand.status === 'error') {
			const errorMsg = deleteCommand.error ?? translate('nikki.general.errors.delete_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
			dispatch(roleSuiteActions.resetDeleteRoleSuite());
		}
	}, [deleteCommand.status, deleteCommand.error, roleSuiteToDelete, notification, translate, dispatch]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRoleSuiteToDelete(null);
	}, []);

	return { deleteModalOpened, roleSuiteToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

