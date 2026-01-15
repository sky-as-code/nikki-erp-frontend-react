import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, roleActions, selectDeleteRole } from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


// eslint-disable-next-line max-lines-per-function
export function useRoleDelete(roles: Role[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);
	const deleteCommand = useMicroAppSelector(selectDeleteRole);

	const handleDeleteRequest = React.useCallback((roleId: string) => {
		const role = roles.find((entry) => entry.id === roleId);
		if (!role) return;
		setRoleToDelete(role);
		setDeleteModalOpened(true);
	}, [roles]);

	const confirmDelete = React.useCallback(() => {
		if (!roleToDelete) return;
		dispatch(roleActions.deleteRole({ id: roleToDelete.id }));
	}, [dispatch, roleToDelete]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			const msg = translate('nikki.authorize.role.messages.delete_success', { name: roleToDelete?.name });
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			dispatch(roleActions.resetDeleteRole());
			dispatch(roleActions.listRoles());
			setDeleteModalOpened(false);
			setRoleToDelete(null);
		}
		if (deleteCommand.status === 'error') {
			const errorMsg = deleteCommand.error ?? translate('nikki.general.errors.delete_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
			dispatch(roleActions.resetDeleteRole());
		}
	}, [deleteCommand.status, deleteCommand.error, roleToDelete, notification, translate, dispatch]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRoleToDelete(null);
	}, []);

	return { deleteModalOpened, roleToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}
