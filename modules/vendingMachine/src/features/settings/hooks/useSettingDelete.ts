import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { settingActions, selectDeleteSetting, VendingMachineDispatch } from '@/appState';

import { Setting } from '../types';


export const useSettingDelete = () => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [settingToDelete, setSettingToDelete] = React.useState<Setting | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteSetting);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const deleteRequestIdRef = React.useRef<string | null>(null);

	const handleOpenDeleteModal = React.useCallback((setting: Setting) => {
		setSettingToDelete(setting);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setSettingToDelete(null);
	}, []);

	const handleDelete = React.useCallback((settingId: string) => {
		const action = dispatch(settingActions.deleteSetting({ id: settingId }));
		deleteRequestIdRef.current = action.requestId;
	}, [dispatch]);

	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && requestId === deleteRequestIdRef.current;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			deleteRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.settings.messages.delete_success'),
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
		settingToDelete,
	};
};
