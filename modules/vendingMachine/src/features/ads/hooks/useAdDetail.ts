import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, adActions, selectAdDetail } from '@/appState';


export function useAdDetail(adId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectAdDetail);

	React.useEffect(() => {
		if (adId) {
			dispatch(adActions.getAd(adId));
		}
	}, [adId, dispatch]);

	return {
		ad: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}

