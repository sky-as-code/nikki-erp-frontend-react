import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskDeviceActions, selectKioskDeviceDetail } from '@/appState';


export function useKioskDeviceDetail(kioskDeviceId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskDeviceDetail);

	React.useEffect(() => {
		if (kioskDeviceId) {
			dispatch(kioskDeviceActions.getKioskDevice(kioskDeviceId));
		}
	}, [kioskDeviceId, dispatch]);

	return {
		kioskDevice: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
