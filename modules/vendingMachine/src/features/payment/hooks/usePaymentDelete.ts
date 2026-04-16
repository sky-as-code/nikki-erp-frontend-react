import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { paymentActions, selectDeletePayment, VendingMachineDispatch } from '@/appState';

import { PaymentMethod } from '../types';



export interface UsePaymentDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}

function useDeleteOutcomeSync(
	deleteState: ReduxActionState<void>,
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
				translate('nikki.vendingMachine.payment.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			handleCloseDeleteModal();
			onDeleteSuccess();
			dispatch(paymentActions.resetDeletePayment());
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
			dispatch(paymentActions.resetDeletePayment());
		}
	}, [deleteState, dispatch, notification, translate, handleCloseDeleteModal, onDeleteSuccess, onDeleteError]);
}

export const usePaymentDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UsePaymentDeleteProps = {
	onDeleteSuccess: () => {},
	onDeleteError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedDeleteRequestIdRef = React.useRef<string | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeletePayment);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [paymentToDelete, setPaymentToDelete] = React.useState<PaymentMethod | null>(null);

	const handleOpenDeleteModal = React.useCallback((paymentMethod: PaymentMethod) => {
		setPaymentToDelete(paymentMethod);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setPaymentToDelete(null);
	}, []);

	const handleDelete = React.useCallback((paymentId: string) => {
		const pendingAction = dispatch(paymentActions.deletePayment({ id: paymentId }));
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
		paymentToDelete,
	};
};

/** @deprecated Use usePaymentDelete */
export const usePaymentMethodDelete = usePaymentDelete;
