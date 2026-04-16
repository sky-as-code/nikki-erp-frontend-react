import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, kioskSettingActions, selectDeleteKioskSetting } from '@/appState';

import { type KioskSetting } from '../types';


// eslint-disable-next-line max-lines-per-function
export const useKioskSettingDelete = (onRefresh?: () => void) => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [settingToDelete, setSettingToDelete] = React.useState<KioskSetting | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKioskSetting);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const deleteRequestIdRef = React.useRef<string | null>(null);

	const handleOpenDeleteModal = (setting: KioskSetting) => {
		setSettingToDelete(setting);
		setIsOpenDeleteModal(true);
	};
	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setSettingToDelete(null);
	}, []);

	const handleDelete = React.useCallback((settingId: string) => {
		const action = dispatch(kioskSettingActions.deleteKioskSetting({ id: settingId }));
		deleteRequestIdRef.current = action.requestId;
	}, [dispatch]);

	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && requestId === deleteRequestIdRef.current;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			deleteRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.general.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskSettingActions.resetDeleteKioskSetting());
			handleCloseDeleteModal();
			onRefresh?.();
		}
		if (deleteState.status === 'error') {
			deleteRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskSettingActions.resetDeleteKioskSetting());
		}
	}, [deleteState, dispatch, notification, translate, onRefresh, handleCloseDeleteModal]);

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		settingToDelete,
	};
};
