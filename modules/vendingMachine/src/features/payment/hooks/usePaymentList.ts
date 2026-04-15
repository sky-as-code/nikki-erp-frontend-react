import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, paymentActions, selectPaymentList } from '@/appState';
import { SearchGraph } from '@/types';


export function usePaymentList(graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const payments = useMicroAppSelector(selectPaymentList);

	React.useEffect(() => {
		if (payments.status === 'idle') {
			dispatch(paymentActions.listPayments());
		}
	}, [dispatch, payments]);

	React.useEffect(() => {
		if (graph) {
			dispatch(paymentActions.listPayments({ graph }));
		}
	}, [graph]);


	const handleRefresh = () => dispatch(paymentActions.listPayments());

	return {
		payments: payments.data ?? [],
		isLoadingList: payments.status === 'pending' || payments.status === 'idle',
		handleRefresh,
	};
}
