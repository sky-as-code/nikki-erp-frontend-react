import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskModelActions, selectKioskModelList } from '@/appState';


export function useKioskModelList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskModelList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(kioskModelActions.listKioskModels());
		}
	}, [dispatch, list]);

	const handleRefresh = () => dispatch(kioskModelActions.listKioskModels());

	return {
		models: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
