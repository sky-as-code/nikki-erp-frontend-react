import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, paymentActions, selectPaymentList } from '@/appState';
import { SearchGraph } from '@/types';


export function usePaymentList(graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectPaymentList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(paymentActions.listPayments());
		}
	}, [dispatch, list.status]);

	React.useEffect(() => {
		if (graph) {
			dispatch(paymentActions.listPayments({ graph }));
		}
	}, [dispatch, graph]);

	const handleRefresh = React.useCallback(() => {
		dispatch(paymentActions.listPayments({ graph }));
	}, [dispatch, graph]);

	const payments = list.data ?? [];
	const status = list.status;
	const isLoading = !payments.length && (status === 'pending' || status === 'idle');
	const isEmpty = !payments.length && status !== 'idle' && status !== 'pending';

	return {
		payments,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		/** Used by payment pickers (e.g. kiosk form) while the list request is in-flight or not yet loaded */
		isLoadingList: isLoading,
	};
}
