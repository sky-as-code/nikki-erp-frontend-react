import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { kioskModelActions, selectDeleteKioskModel, VendingMachineDispatch } from '@/appState';

import { KioskModel } from '../types';


export const useKioskModelDelete = () => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [modelToDelete, setModelToDelete] = React.useState<KioskModel | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKioskModel);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const handleOpenDeleteModal = (kioskModel: KioskModel) => {
		setModelToDelete(kioskModel);
		setIsOpenDeleteModal(true);
	};

	const handleCloseDeleteModal = () => {
		setIsOpenDeleteModal(false);
		setModelToDelete(null);
	};

	const handleDelete = React.useCallback((modelId: string) => {
		dispatch(kioskModelActions.deleteKioskModel({ id: modelId }));
	}, [dispatch]);

	React.useEffect(() => {
		if (deleteState.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kioskModels.messages.delete_success'),
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
		modelToDelete,
	};
};
