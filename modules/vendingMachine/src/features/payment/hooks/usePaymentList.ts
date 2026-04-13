import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, paymentActions, selectPaymentList } from '@/appState';
import { SearchGraph } from '@/components';


export function usePaymentList(graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectPaymentList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(paymentActions.listPayments({ graph }));
		}
	}, [dispatch, list]);

	React.useEffect(() => {
		if (graph) {
			dispatch(paymentActions.listPayments({ graph }));
		}
	}, [graph]);


	const handleRefresh = () => dispatch(paymentActions.listPayments());

	return {
		payments: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
