import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { kioskModelActions, selectDeleteKioskModel, VendingMachineDispatch } from '@/appState';
import { RestDeleteResponse } from '@/types';

import { KioskModel } from '../types';



export interface UseKioskModelDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}

function useDeleteOutcomeSync(
	deleteState: ReduxActionState<RestDeleteResponse>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleCloseDeleteModal: () => void,
	onDeleteSuccess: () => void,
	onDeleteError: () => void,
) {
	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.kioskModels.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			handleCloseDeleteModal();
			onDeleteSuccess();
			dispatch(kioskModelActions.resetDeleteKioskModel());
			return;
		}
		if (deleteState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			handleCloseDeleteModal();
			onDeleteError();
			dispatch(kioskModelActions.resetDeleteKioskModel());
		}
	}, [deleteState, dispatch, notification, translate, handleCloseDeleteModal, onDeleteSuccess, onDeleteError]);
}

export const useKioskModelDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UseKioskModelDeleteProps = {
	onDeleteSuccess: () => {},
	onDeleteError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedDeleteRequestIdRef = React.useRef<string | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKioskModel);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [modelToDelete, setModelToDelete] = React.useState<KioskModel | null>(null);

	const handleOpenDeleteModal = React.useCallback((kioskModel: KioskModel) => {
		setModelToDelete(kioskModel);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setModelToDelete(null);
	}, []);

	const handleDelete = React.useCallback((modelId: string) => {
		const pendingAction = dispatch(kioskModelActions.deleteKioskModel({ id: modelId }));
		dispatchedDeleteRequestIdRef.current = pendingAction.requestId;
	}, [dispatch]);

	useDeleteOutcomeSync(
		deleteState,
		dispatchedDeleteRequestIdRef,
		dispatch,
		notification,
		translate,
		handleCloseDeleteModal,
		onDeleteSuccess,
		onDeleteError,
	);

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		modelToDelete,
	};
};
