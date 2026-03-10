import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskActions, selectKioskDetail } from '@/appState';


export function useKioskDetail(kioskId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskDetail);

	React.useEffect(() => {
		if (kioskId) {
			dispatch(kioskActions.getKiosk(kioskId));
		}
	}, [kioskId, dispatch]);

	return {
		kiosk: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}

