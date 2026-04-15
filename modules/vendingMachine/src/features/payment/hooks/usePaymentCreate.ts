import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { paymentActions, selectCreatePayment, VendingMachineDispatch } from '@/appState';

import type { PaymentMethod } from '@/features/payment/types';



export type PaymentCreateFormData = Pick<PaymentMethod, 'name' | 'method'> & Partial<
	Pick<PaymentMethod, 'image' | 'config' | 'isArchived'>
>;

export function usePaymentCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createPaymentState = useMicroAppSelector(selectCreatePayment);
	const createRequestIdRef = React.useRef<string | null>(null);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: PaymentCreateFormData) => {
		const payload = {
			name: data.name,
			method: data.method,
			isArchived: data.isArchived ?? false,
			...(data.image !== undefined && { image: data.image }),
			...(data.config !== undefined && { config: data.config }),
		} as Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>;
		const action = dispatch(paymentActions.createPayment(payload));
		createRequestIdRef.current = action.requestId;
	}, [dispatch]);

	const isSubmitting = createPaymentState.status === 'pending';

	React.useEffect(() => {
		const requestId = createPaymentState.requestId;
		const matchesDispatch = requestId != null && requestId === createRequestIdRef.current;
		if (!matchesDispatch) return;

		if (createPaymentState.status === 'success') {
			createRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.payment.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(paymentActions.resetCreatePayment());
			dispatch(paymentActions.listPayments());
			const createdId = createPaymentState.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createPaymentState.status === 'error') {
			createRequestIdRef.current = null;
			notification.showError(
				createPaymentState.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(paymentActions.resetCreatePayment());
		}
	}, [createPaymentState, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
