import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, paymentActions, selectPaymentList } from '@/appState';


export function usePaymentList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectPaymentList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(paymentActions.listPayments());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(paymentActions.listPayments());

	return {
		payments: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
