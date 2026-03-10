import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskDeviceActions, selectKioskDeviceList } from '@/appState';


export function useKioskDeviceList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskDeviceList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(kioskDeviceActions.listKioskDevices());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(kioskDeviceActions.listKioskDevices());

	return {
		kioskDevices: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
