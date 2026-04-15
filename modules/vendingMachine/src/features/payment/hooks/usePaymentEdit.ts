import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { paymentActions, selectUpdatePayment, VendingMachineDispatch } from '@/appState';

import type { PaymentMethod } from '@/features/payment/types';



export type PaymentUpdateFormData = { id: string; etag: string } & Pick<
	Partial<PaymentMethod>,
	'name' | 'method' | 'image' | 'config'
>;

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onUpdateSuccess?: () => void,
) {
	const updateState = useMicroAppSelector(selectUpdatePayment);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateState.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateState.status === 'success') {
			updateRequestIdRef.current = null;
			dispatch(paymentActions.resetUpdatePayment());
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.payment.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
		}
		else if (updateState.status === 'error') {
			updateRequestIdRef.current = null;
			dispatch(paymentActions.resetUpdatePayment());
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [updateState, dispatch, notification, translate, onUpdateSuccess]);

	const handleSubmit = useCallback((payload: {
		id: string;
		etag: string;
		updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>>;
	}) => {
		const action = dispatch(paymentActions.updatePayment(payload));
		updateRequestIdRef.current = action.requestId;
	}, [dispatch]);

	return {
		isSubmitting: updateState.status === 'pending',
		handleSubmit,
	};
}

export function usePaymentEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		dispatch,
		notification,
		translate,
		onUpdateSuccess,
	);

	const submit = useCallback(
		(modelData: PaymentUpdateFormData) => {
			if (!modelData.id || !modelData.etag) return;
			const { id, etag, name, method, image, config } = modelData;
			handleSubmit({
				id,
				etag,
				updates: { name, method, image, config },
			});
		},
		[handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
