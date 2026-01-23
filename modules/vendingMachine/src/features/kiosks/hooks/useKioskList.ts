import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskActions, selectKioskList } from '@/appState';


export function useKioskList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(kioskActions.listKiosks());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(kioskActions.listKiosks());

	return {
		kiosks: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}

