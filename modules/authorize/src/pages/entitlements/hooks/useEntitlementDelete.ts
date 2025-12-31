import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, entitlementActions } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements';


function handleDeleteResult(
	result: Awaited<ReturnType<ReturnType<typeof entitlementActions.deleteEntitlement>>>,
	entitlementName: string,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setEntitlementToDelete: React.Dispatch<React.SetStateAction<Entitlement | null>>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.entitlement.messages.delete_success', { name: entitlementName }),
			translate('nikki.general.messages.success'),
		);
		dispatch(entitlementActions.listEntitlements());
	}
	else {
		const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.delete_failed');
		notification.showError(errorMessage, translate('nikki.general.messages.error'));
	}
	setDeleteModalOpened(false);
	setEntitlementToDelete(null);
}

function useConfirmDelete(
	entitlementToDelete: Entitlement | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setDeleteModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
	setEntitlementToDelete: React.Dispatch<React.SetStateAction<Entitlement | null>>,
) {
	return React.useCallback(() => {
		if (!entitlementToDelete) return;
		dispatch(entitlementActions.deleteEntitlement(entitlementToDelete.id)).then((result) => {
			handleDeleteResult(
				result,
				entitlementToDelete.name,
				dispatch,
				notification,
				translate,
				setDeleteModalOpened,
				setEntitlementToDelete,
			);
		});
	}, [dispatch, entitlementToDelete, notification, translate, setDeleteModalOpened, setEntitlementToDelete]);
}

export function useEntitlementDeleteHandler(entitlements: Entitlement[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [entitlementToDelete, setEntitlementToDelete] = React.useState<Entitlement | null>(null);

	const handleDeleteRequest = React.useCallback((entitlementId: string) => {
		const entitlement = entitlements.find((entry) => entry.id === entitlementId);
		if (!entitlement) return;
		setEntitlementToDelete(entitlement);
		setDeleteModalOpened(true);
	}, [entitlements]);

	const confirmDelete = useConfirmDelete(
		entitlementToDelete,
		dispatch,
		notification,
		translate,
		setDeleteModalOpened,
		setEntitlementToDelete,
	);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setEntitlementToDelete(null);
	}, []);

	return { deleteModalOpened, entitlementToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

