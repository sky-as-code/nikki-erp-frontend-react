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

	const handleOpenDeleteModal = React.useCallback((setting: Setting) => {
		setSettingToDelete(setting);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setSettingToDelete(null);
	}, []);

	const handleDelete = React.useCallback((settingId: string) => {
		dispatch(settingActions.deleteSetting({ id: settingId }));
	}, [dispatch]);

	React.useEffect(() => {
		if (deleteState.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.settings.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
		}
	}, [deleteState, notification, translate]);

	React.useEffect(() => {
		if (deleteState.status === 'error') {
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
