import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskModelActions, selectKioskModelDetail } from '@/appState';

import { KioskModel } from '../types';


export function useKioskModelDetail(modelId?: string): { model: KioskModel | undefined; isLoading: boolean } {
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
