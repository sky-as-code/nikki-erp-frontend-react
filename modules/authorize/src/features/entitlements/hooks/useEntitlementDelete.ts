import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, entitlementActions, selectDeleteEntitlement } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements';


function useConfirmDelete(
	entitlementToDelete: Entitlement | null,
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback(() => {
		if (!entitlementToDelete) return;
		dispatch(entitlementActions.deleteEntitlement(entitlementToDelete.id));
	}, [dispatch, entitlementToDelete]);
}

// eslint-disable-next-line max-lines-per-function
export function useEntitlementDelete(entitlements: Entitlement[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [entitlementToDelete, setEntitlementToDelete] = React.useState<Entitlement | null>(null);

	const deleteCommand = useMicroAppSelector(selectDeleteEntitlement);

	const handleDeleteRequest = React.useCallback((entitlementId: string) => {
		const entitlement = entitlements.find((entry) => entry.id === entitlementId);
		if (!entitlement) return;
		setEntitlementToDelete(entitlement);
		setDeleteModalOpened(true);
	}, [entitlements]);

	const confirmDelete = useConfirmDelete(
		entitlementToDelete,
		dispatch,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setEntitlementToDelete(null);
	}, []);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.entitlement.messages.delete_success', { name: entitlementToDelete?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(entitlementActions.resetDeleteEntitlement());
			dispatch(entitlementActions.listEntitlements());
			setDeleteModalOpened(false);
			setEntitlementToDelete(null);
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				deleteCommand.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(entitlementActions.resetDeleteEntitlement());
		}
	}, [deleteCommand.status, deleteCommand.error, entitlementToDelete, notification, translate, dispatch]);

	return { deleteModalOpened, entitlementToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

