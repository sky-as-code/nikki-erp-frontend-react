import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, roleActions } from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useRoleDeleteHandler(roles: Role[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);

	const handleDeleteRequest = React.useCallback((roleId: string) => {
		const role = roles.find((entry) => entry.id === roleId);
		if (!role) return;
		setRoleToDelete(role);
		setDeleteModalOpened(true);
	}, [roles]);

	const confirmDelete = useConfirmDeleteHandler(
		roleToDelete, dispatch, notification, translate, setDeleteModalOpened, setRoleToDelete,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRoleToDelete(null);
	}, []);

	return { deleteModalOpened, roleToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function useConfirmDeleteHandler(
	roleToDelete: Role | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setRoleToDelete: React.Dispatch<React.SetStateAction<Role | null>>,
) {
	return React.useCallback(() => {
		if (!roleToDelete) return;

		dispatch(roleActions.deleteRole({ id: roleToDelete.id })).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				const msg = translate('nikki.authorize.role.messages.delete_success', { name: roleToDelete.name });
				notification.showInfo(msg, translate('nikki.general.messages.success'));
				dispatch(roleActions.listRoles());
			}
			else {
				const errorMsg = typeof result.payload === 'string'
					? result.payload
					: translate('nikki.general.errors.delete_failed');
				notification.showError(errorMsg, translate('nikki.general.messages.error'));
			}
			setDeleteModalOpened(false);
			setRoleToDelete(null);
		});
	}, [dispatch, roleToDelete, notification, translate, setDeleteModalOpened, setRoleToDelete]);
}
