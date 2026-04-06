import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, kioskActions, selectDeleteKiosk } from '@/appState';

import { type Kiosk } from '../types';




export const useKioskDelete = () => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [kioskToDelete, setKioskToDelete] = React.useState<Kiosk | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKiosk);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

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
		dispatch(kioskActions.deleteKiosk({ id: kioskToDelete?.id || '' }));
	}, [dispatch, kioskToDelete]);

	useEffect(() => {
		if (deleteState.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetDeleteKiosk());
			dispatch(kioskActions.listKiosks());
		}
	}, [deleteState, dispatch, notification, translate]);

	useEffect(() => {
		if (deleteState.status === 'error') {
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
