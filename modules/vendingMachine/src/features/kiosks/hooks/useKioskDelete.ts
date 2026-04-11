import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { type Kiosk } from '../types';

import { VendingMachineDispatch, kioskActions, selectDeleteKiosk } from '@/appState';



// eslint-disable-next-line max-lines-per-function
export const useKioskDelete = ({onDeleteSuccess}: {onDeleteSuccess?: () => void}) => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [kioskToDelete, setKioskToDelete] = React.useState<Kiosk | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKiosk);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const deleteRequestIdRef = React.useRef<string | null>(null);

	const openDeleteModal = React.useCallback((kiosk: Kiosk) => {
		setKioskToDelete(kiosk);
		setIsOpenDeleteModal(true);
	}, []);

	const closeDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setKioskToDelete(null);
	}, []);

	const handleDelete = React.useCallback(() => {
		if (!kioskToDelete) return;
		const action = dispatch(kioskActions.deleteKiosk({ id: kioskToDelete?.id || '' }));
		deleteRequestIdRef.current = action.requestId;
	}, [dispatch, kioskToDelete]);

	useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && requestId === deleteRequestIdRef.current;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			deleteRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetDeleteKiosk());
			closeDeleteModal();
			onDeleteSuccess?.();
		}
		if (deleteState.status === 'error') {
			deleteRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetDeleteKiosk());
		}
	}, [deleteState, dispatch, notification, translate]);



	return {
		handleDelete,
		openDeleteModal,
		closeDeleteModal,
		isOpenDeleteModal,
		kioskToDelete,
	};
};
