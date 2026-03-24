import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, paymentActions, selectPaymentDetail } from '@/appState';


export function usePaymentDetail(paymentId: string | undefined) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectPaymentDetail);

	React.useEffect(() => {
		if (paymentId && detail.data?.id !== paymentId) {
			dispatch(paymentActions.getPayment(paymentId));
		}
	}, [dispatch, paymentId, detail.data?.id]);

	return {
		payment: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
