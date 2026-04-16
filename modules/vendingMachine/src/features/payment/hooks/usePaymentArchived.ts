/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { paymentActions, selectSetArchivedPayment, VendingMachineDispatch } from '@/appState';
import { RestArchiveResponse } from '@/types';

import { PaymentMethod } from '../types';


export interface UsePaymentArchivedProps {
	onArchiveSuccess?: () => void;
	onArchiveError?: () => void;
}

type PendingArchive = { payment: PaymentMethod; targetArchived: boolean };

function useArchiveOutcomeSync(
	archiveState: ReduxActionState<RestArchiveResponse>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	pendingTargetArchivedRef: React.RefObject<boolean | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleCloseModal: () => void,
	onArchiveSuccess: () => void,
	onArchiveError: () => void,
) {
	React.useEffect(() => {
		const requestId = archiveState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (archiveState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			const archived = pendingTargetArchivedRef.current === true;
			pendingTargetArchivedRef.current = null;
			const messageKey = archived
				? 'nikki.vendingMachine.payment.messages.archive_success'
				: 'nikki.vendingMachine.payment.messages.restore_success';
			notification.showInfo(
				translate(messageKey),
				translate('nikki.general.messages.success'),
			);
			handleCloseModal();
			onArchiveSuccess();
			dispatch(paymentActions.resetSetArchivedPayment());
			return;
		}
		if (archiveState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			pendingTargetArchivedRef.current = null;
			notification.showError(
				archiveState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			handleCloseModal();
			onArchiveError();
			dispatch(paymentActions.resetSetArchivedPayment());
		}
	}, [
		archiveState, dispatch, notification, translate, handleCloseModal,
		onArchiveSuccess, onArchiveError, pendingTargetArchivedRef,
	]);
}

export const usePaymentArchived = ({
	onArchiveSuccess = () => {},
	onArchiveError = () => {},
}: UsePaymentArchivedProps = {
	onArchiveSuccess: () => {},
	onArchiveError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedArchiveRequestIdRef = React.useRef<string | null>(null);
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const archiveState = useMicroAppSelector(selectSetArchivedPayment);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((payment: PaymentMethod) => {
		setPendingArchive({ payment, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((payment: PaymentMethod) => {
		setPendingArchive({ payment, targetArchived: false });
	}, []);

	const handleConfirmArchive = React.useCallback(() => {
		if (!pendingArchive?.payment.etag) {
			notification.showError(
				translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.payment;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		const pendingAction = dispatch(
			paymentActions.setArchivedPayment({ id, etag, isArchived: targetArchived }),
		);
		dispatchedArchiveRequestIdRef.current = pendingAction.requestId;
	}, [dispatch, notification, pendingArchive, translate]);

	useArchiveOutcomeSync(
		archiveState,
		dispatchedArchiveRequestIdRef,
		pendingTargetArchivedRef,
		dispatch,
		notification,
		translate,
		handleCloseModal,
		onArchiveSuccess,
		onArchiveError,
	);

	const isOpenArchiveModal = pendingArchive != null;

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal,
		isOpenArchiveModal,
		pendingArchive,
	};
};
