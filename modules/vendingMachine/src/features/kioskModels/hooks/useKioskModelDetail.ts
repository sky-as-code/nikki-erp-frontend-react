import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskModelActions, selectKioskModelDetail } from '@/appState';


export function useKioskModelDetail(modelId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskModelDetail);

	React.useEffect(() => {
		if (modelId) {
			dispatch(kioskModelActions.getKioskModel(modelId));
		}
	}, [modelId, dispatch]);

	return {
		model: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
