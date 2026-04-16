import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { kioskDeviceActions, selectDeleteKioskDevice, VendingMachineDispatch } from '@/appState';

import { KioskDevice } from '../types';


export const useKioskDeviceDelete = () => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [deviceToDelete, setDeviceToDelete] = React.useState<KioskDevice | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKioskDevice);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const deleteRequestIdRef = React.useRef<string | null>(null);

	const handleOpenDeleteModal = React.useCallback((kioskDevice: KioskDevice) => {
		setDeviceToDelete(kioskDevice);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setDeviceToDelete(null);
	}, []);

	const handleDelete = React.useCallback((deviceId: string) => {
		const action = dispatch(kioskDeviceActions.deleteKioskDevice({ id: deviceId }));
		deleteRequestIdRef.current = action.requestId;
	}, [dispatch]);

	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && requestId === deleteRequestIdRef.current;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			deleteRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.device.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
		}
		if (deleteState.status === 'error') {
			deleteRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [deleteState, notification, translate]);


	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		deviceToDelete,
	};
};
